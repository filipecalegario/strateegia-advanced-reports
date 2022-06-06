import { Box } from "@chakra-ui/react";
import { CSVLink } from "react-csv";
import { ButtonExp } from "./ButtonToExport";

export function ExportsButtons({ project, data, headers, saveFile }) {
  
  return (
    <Box display="flex" justifyContent="flex-end" alignItems='flex-end' m='4px'>
      <ButtonExp click={saveFile} project={project} text='docx'/>
      <CSVLink
        data={data}
        headers={headers}
        filename="strateegia_conversation_points_report-csv.csv"
      >
        <ButtonExp click={null} project={project} text='csv'/>
      </CSVLink>
      <ButtonExp click={() => exportJSONData(data)} project={project} text='json'/>
    </Box>
  );
}

export const exportJSONData = (data) => {
  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(data)
  )}`;

  const link = document.createElement("a");
  link.href = jsonString;
  link.download = "strateegia_convergence_points_report-json.json";

  link.click();
};
