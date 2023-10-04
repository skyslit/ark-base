import { defineService, Data } from "@skyslit/ark-backend";
import DemoData from "../../../main/toolkit/providers/compass-demo"

export default defineService("fetchDemoDataByProjectId", (props) => {
    const { useModel } = props.use(Data);


    props.defineLogic(async (props) => {
    const { projectId } = props.args.input;
        let data: any = null;
        
        data = await DemoData.fetchDemoDataByProjectId(projectId,false)
        
        return props.success(
            { message: "data fetched" },
            data
        );
    });
});