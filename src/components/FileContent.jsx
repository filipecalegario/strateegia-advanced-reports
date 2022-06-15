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
            const docData = []
            checkpointAndComments.map(({mapTitle, checkpointAndCommentsArr}) => {
                const data = {
                    map_title: mapTitle,
                    meetings_details: checkpointAndCommentsArr.map(({checkpoint, comments}) => {
                        return {
                            heading: checkpoint.description,
                            meeting_at: checkpoint.meeting_place,
                            date: checkpoint.opening_date,
                            'user_name': comments.map(({author}) => author?.name + ' :'),
                            'comment': comments.map(({text}) => text),
                        }
                    })
                }
                docData.push(data)
                
            })
            console.log("🚀 ~ file: FileContent.jsx ~ line 40 ~ docData ~ docData", docData.flat())
            // });

            doc.render({
                'meetings': docData.flat()
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
        label: "Map title",
        key: "map_title"
    },
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

export const getCsvData = async (checkpointAndComments) => {

    const checkpoints = await Promise.all(
        checkpointAndComments?.map(({ mapTitle, checkpointAndCommentsArr }) =>
        {
        return checkpointAndCommentsArr?.map(({ checkpoint }) => {
            return {
                map_title: mapTitle,
                description: checkpoint.description,
                meeting_place: checkpoint.meeting_place,
                opening_date: checkpoint.opening_date,
            }      
            });
        })
    ).then(data => {
        return data.flat()
    });

    const comments = await Promise.all(
        checkpointAndComments?.map(({checkpointAndCommentsArr}) => {
        return checkpointAndCommentsArr?.map(({ comments }) => {
            return comments?.map(({author, text}) => {
            return {
                author: author.name, text: text
            }
            })
        })
        })      
    ).then(data => {
        return data.flat()
    });

    const checkpointCommentsCSV = comments?.map( (cmt, index) => {
        return {...checkpoints[index], authors: cmt?.map(({author}) => author), texts: cmt?.map(({text}) => text )};
    });
    
    return checkpointCommentsCSV;
};
