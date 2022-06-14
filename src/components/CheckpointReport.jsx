import React from 'react';
import { Box, UnorderedList, ListItem, Text, Heading } from '@chakra-ui/react';
import { ExportsButtons } from './ExportsButtons';
import { headers, generateDocument, getCsvData } from './FileContent';
import { i18n } from "../translate/i18n";

export function CheckpointReport({ checkpointAndComments }) {
  const [csvData, setCsvData] = React.useState();

  React.useEffect(() => {
    async function fetchData () {
      const checkpointCommentsCSV = await getCsvData(checkpointAndComments);
      setCsvData(checkpointCommentsCSV)
    }
    fetchData();
  }, [checkpointAndComments])

  return (
    <>
      <ExportsButtons headers={headers} data={csvData || ''} saveFile={() => generateDocument(checkpointAndComments)} project={checkpointAndComments}/>
      <Heading as="h3" size="lg" mb={12} mt={3} >
        {i18n.t('main.heading')}
      </Heading>
      {checkpointAndComments && (
        <>
          {checkpointAndComments.map(({mapTitle, mapId, checkpointAndCommentsArr}) => (
            <Box mt={10} >
              <Heading as="h4" fontSize={24} mb={12} mt={3}  key={mapId}> mapa: {mapTitle}</Heading>
            {checkpointAndCommentsArr.map(({checkpoint, comments}) => 
            (
              <>
                <Text fontWeight={600}>{checkpoint.description}</Text>
                <Text mt={2}>{i18n.t('checkpointReport.place')}: {checkpoint.meeting_place}</Text>
                <Text mt={2}>
                  {i18n.t('checkpointReport.date')}:{' '}
                  {new Date(
                    checkpoint.opening_date
                  ).toLocaleString('pt-BR')}
                </Text>
                <UnorderedList mt={10} ml={0}>
                  {comments.map(comment => (
                    <ListItem key={comment.id} listStyleType='none'>
                      <Text>
                        {comment.author.name}: {comment.text}
                      </Text>
                      {/* <Text>Criador: {comment.author.name}</Text> */}
                    </ListItem>
                  ))}
                </UnorderedList>
              </>
            ))}
            </Box>
          ))}
        </>
      )}
    </>   
  );
}

