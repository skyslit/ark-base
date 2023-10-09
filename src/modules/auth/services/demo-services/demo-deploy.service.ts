import { defineService, Data, IArkVolume, Backend } from "@skyslit/ark-backend";
import Joi from "joi";
import fs from "fs-extra";
import path from "path";
import extract from "extract-zip";
import { useEnv } from "@skyslit/ark-core";
import { exec } from "child_process";
import { glob } from "glob";
import mongodb from 'mongodb';
import { SUPER_ADMIN_EMAIL, addSuperAdmin } from "../add-admin-account.service";
import moment from 'moment';

async function downloadArchive(archiveId: string, destFilePath: string) {
  return new Promise((resolve, reject) => {
    const importCommand = `curl https://compass.skyslit.com/api/v1/demo-archives?exportId=${archiveId} --output ${destFilePath}`;
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

async function importCollection(
  dbConnStr: string,
  collectionName: string,
  filePath: string
) {
  return new Promise<boolean>((resolve, reject) => {
    const BINPATH = useEnv("MONGO_IMPORT_BIN_PATH");
    const importCommand = `${BINPATH} --uri ${dbConnStr} --collection=${collectionName} --file=${filePath}`;
    exec(importCommand, {}, (err, stdout, stderr) => {
      console.log(err, stdout, stderr);
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

async function uploadBlob(blobRootDir: string, volume: IArkVolume) {
  const files = await glob("**", {
    cwd: blobRootDir,
    withFileTypes: true,
  });

  for (const file of files) {
    if (file.isDirectory() === true) {
      continue;
    }

    const fullPath = file.fullpath();
    const relativePath = path.relative(blobRootDir, fullPath);

    await new Promise<void>((resolve, reject) => {
      const reader = fs.createReadStream(fullPath);
      const writer = volume.createWriteStream(relativePath);
      reader.on("close", resolve);
      reader.on("error", reject);
      reader.pipe(writer);
    });

    console.log(`Uploaded ${relativePath}`);
  }
}

function extractZip(archiveFilePath: string, outputDir: string) {
  return extract(archiveFilePath, { dir: outputDir });
}

async function cleanup(dirPath: string) {
  fs.emptyDirSync(dirPath);
  fs.rmdirSync(dirPath);
}

async function deployDemoArchive(
  archiveId: string, 
  volume: IArkVolume,
  setupSuperAdmin: () => any
) {
  const ARCHIVE_DIR = path.join(__dirname, "../../archive-download");
  const TEMP_DIR = path.join(ARCHIVE_DIR, archiveId);
  const ARCHIVE_FILE_PATH = path.join(TEMP_DIR, "archive");

  try {
    fs.mkdirSync(TEMP_DIR, { recursive: true });

    await downloadArchive(archiveId, ARCHIVE_FILE_PATH);
    console.log("Archive downloaded");

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

        const c = await mongodb.connect(dbConnStr, { useUnifiedTopology: true });
        await c.db().dropDatabase();
        await c.close();

        for (const collection of metaData.mongoCollections.filter(
          (c) => c.databaseId === databaseId
        )) {
          const { collectionName, exportFileName, databaseDirName } =
            collection as any;

          await importCollection(
            dbConnStr,
            collectionName,
            path.join(TEMP_DIR, databaseDirName, exportFileName)
          );
          console.log(`Collection ${collectionName} imported`);
        }
        
        await setupSuperAdmin();
      }
    }

    for (const blob of metaData.blobs) {
      const { blobEnvVarName, blobDirName, wsBucketId } = blob;
      if (["WS_BLOB_BUCKET_ID"].indexOf(blobEnvVarName) > -1) {
        const blobRootDir = path.join(TEMP_DIR, blobDirName, wsBucketId);
        await uploadBlob(blobRootDir, volume);
      }
    }
  } catch (e) {
    await cleanup(TEMP_DIR);
    throw e;
  }

  await cleanup(TEMP_DIR);
}

export const deployDemoArchiveService = defineService("deploy-demo-archive", (props) => {
  const { useRemoteConfig } = props.use(Backend);
  const { useVolume, useModel } = props.use(Data);
  
  const AccountModel = useModel("account");
  const GroupModel = useModel("group");
  const MemberModel = useModel("member-assignment");

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
    const volume = useVolume();
    const { put } = useRemoteConfig();

    await deployDemoArchive(archiveId, volume, async () => {
      const result = await addSuperAdmin(AccountModel, GroupModel, MemberModel, SUPER_ADMIN_EMAIL, moment().valueOf());

      if (result) {
        props.login(
          props.security.jwt.sign({
            _id: result.user._id,
            name: result.user.name,
            password: undefined,
          })
        );
      }
    });

    await put('private', 'canDeployDemoData', false);

    return props.success({ message: "Completed" });
  });
});


export const skipDemoArchiveService = defineService("skip-demo-archive", (props) => {
  const { useRemoteConfig } = props.use(Backend);
  props.defineRule((props) => {
    props.allowPolicy("SUPER_ADMIN");
  });

  props.defineLogic(async (props) => {
    const { put } = useRemoteConfig();

    await put('private', 'canDeployDemoData', false);

    return props.success({ message: "Completed" });
  });
});
