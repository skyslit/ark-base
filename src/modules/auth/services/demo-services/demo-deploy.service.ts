import { defineService, Data } from "@skyslit/ark-backend";
import Joi from "joi";
import fs from "fs";
import path from "path";
import extract from "extract-zip";
import { useEnv } from "@skyslit/ark-core";
import { exec } from "child_process";

async function downloadArchive(archiveId: string) {}

async function importCollection(
  dbConnStr: string,
  collectionName: string,
  filePath: string
) {
  return new Promise<boolean>((resolve, reject) => {
    const BINPATH = useEnv("MONGO_IMPORT_BIN_PATH");
    const importCommand = `${BINPATH} --uri ${dbConnStr} --collection=${collectionName} --file=${filePath}`;
    exec(importCommand, (err, stdout, stderr) => {
      console.log(err, stdout, stderr);
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

function extractZip(archiveFilePath: string, outputDir: string) {
  return extract(archiveFilePath, { dir: outputDir });
}

async function cleanup() {}

async function deployDemoArchive(archiveId: string) {
  try {
    const ARCHIVE_DIR = path.join(__dirname, "../../archive-download");
    const TEMP_DIR = path.join(ARCHIVE_DIR, archiveId);
    const ARCHIVE_FILE_PATH = path.join(TEMP_DIR, "archive");

    await downloadArchive(archiveId);
    console.log("Archive downloaded");

    fs.mkdirSync(TEMP_DIR, { recursive: true });

    await extractZip(ARCHIVE_FILE_PATH, TEMP_DIR);
    console.log("Archive extracted");

    let metaData: any = JSON.parse(
      fs.readFileSync(path.join(TEMP_DIR, "metadata.json"), "utf-8")
    );

    if (!metaData) {
      metaData = {};
    }

    if (!metaData?.dbs) {
      metaData.dbs = [];
    }

    if (!metaData?.mongoCollections) {
      metaData.mongoCollections = [];
    }

    for (const db of metaData.dbs) {
      const { databaseId, databaseEnvVarName } = db;
      if (["MONGO_CONNECTION_STRING"].indexOf(databaseEnvVarName) > -1) {
        const dbConnStr = useEnv(databaseEnvVarName);
        for (const collection of metaData.mongoCollections.filter(
          (c) => c.databaseId === databaseId
        )) {
          const { collectionName, exportFileName, databaseDirName } =
            collection;
          await importCollection(
            dbConnStr,
            collectionName,
            path.join(TEMP_DIR, databaseDirName, exportFileName)
          );
          console.log(`Collection ${collectionName} imported`);
        }
      }
    }
  } catch (e) {
    await cleanup();
    throw e;
  }
}

export default defineService("deploy-demo-archive", (props) => {
  props.defineRule((props) => {
    props.allowPolicy("SUPER_ADMIN");
  });

  props.defineValidator(
    Joi.object({
      archiveId: Joi.string().required(),
    })
  );

  props.defineLogic(async (props) => {
    const { archiveId } = props.args.input;
    await deployDemoArchive(archiveId);
    return props.success({ message: "Completed" });
  });
});
