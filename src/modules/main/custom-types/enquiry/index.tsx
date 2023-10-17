import React from "react"; 
import { controller, FileEditor } from "@skyslit/ark-frontend/build/dynamics-v2"; 
import { EnquirySchema } from "./schema/enquiry.schema";
import { EnquiryMetaSchema } from "./schema/enquiryMeta.schema";
import { EnquiryRenderer } from './renderer.tsx';
import { BinaryFileIcon } from "../../toolkit/views/data-explorer/icons/global-icons";

function CustomIcon(props: { style: { height: any, width: any, fontSize: any } }) { 
  return ( 
    <div 
      style={{ 
        width: props?.style?.width,
        height: props?.style?.height,
        backgroundColor: "#ccc", 
      }} /> 
  )
} 

export function initialiseEnquiry() { 
    controller.defineType("enquiry", {
    name: "Enquiry", 
    icon: BinaryFileIcon, 
    toolkit: {
        Renderer: () => {
            return (
                <FileEditor>
                    <EnquiryRenderer />
                </FileEditor>
            )
        }
    },
    fileSchema: EnquirySchema, 
    fileCollectionName: "enquiry",
    propertiesSchema: EnquiryMetaSchema
  })
}