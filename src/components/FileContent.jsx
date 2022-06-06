import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import { reportsCockpit } from '../assets/files' 
import { saveAs } from "file-saver";

function loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
}

export const generateDocument = (checkpointAndComments) => {

    loadFile(
        reportsCockpit,
        function (error, content) {
            if (error) {
                throw error;
            }
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            const docData = checkpointAndComments.map(({checkpoint, comments}) => {
                return { 
                    
                    'heading': checkpoint.description,
                    'meeting_at': checkpoint.meeting_place,
                    'date': checkpoint.opening_date,
    
                    'user_name': comments.map(({author}) => author?.name + ' :'),
                    'comment': comments.map(({text}) => text)
                    
                }
            });

            doc.render({
                'meetings': docData
            });

            const out = doc.getZip().generate({
                type: "blob",
                mimeType:
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            }); //Output the document using Data-URI
            saveAs(out, "strateegia_convergence_points_report-docx.docx");
        }
    );

}



export const headers = [
    {
        label: "Conv. Point Description",
        key: "description",
    },
    {
        label: "Local",
        key: "meeting_place",
    },
    {
        label: "Date",
        key: "opening_date",
    },
    {
        label: "Comments",
        key: "texts",
    },
    {
        label: "Authors",
        key: "authors",
    },
];


