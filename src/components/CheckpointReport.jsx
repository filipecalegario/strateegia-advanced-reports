import { Box, UnorderedList, ListItem, Text, Heading } from '@chakra-ui/react';
import { ExportsButtons } from './ExportsButtons';
import { headers, generateDocument } from './FileContent';
import { i18n } from "../translate/i18n";

export function CheckpointReport({ checkpointAndComments }) {
  
  
    const checkpoint = checkpointAndComments?.map(({ checkpoint }) => {
      return {
        description: checkpoint.description,
        meeting_place: checkpoint.meeting_place,
        opening_date: checkpoint.opening_date,
      }
    });

    const comments = checkpointAndComments?.map(({ comments }) => {
      return comments.map(({author, text}) => {
        return {
          author: author.name, text: text
        }
      })
    });

    const checkpointCommentsCSV = comments?.map( (cmt, index) => {
      return {...checkpoint[index], authors: cmt.map(({author}) => author), texts: cmt.map(({text}) => text )};
    });



  return (
    <>
      <ExportsButtons headers={headers} data={checkpointCommentsCSV || ''} saveFile={() => generateDocument(checkpointAndComments)} project={checkpointAndComments}/>
      <Heading as="h3" size="lg" mb={12} mt={3} >
        {i18n.t('main.heading')}
      </Heading>
      {checkpointAndComments && (
        <>
            {checkpointAndComments.map(checkpointAndComment => (
              <Box mt={10} >
                <Text fontWeight={600}>{checkpointAndComment.checkpoint.description}</Text>
                <Text mt={2}>{i18n.t('checkpointReport.place')}: {checkpointAndComment.checkpoint.meeting_place}</Text>
                <Text mt={2}>
                  {i18n.t('checkpointReport.date')}:{' '}
                  {new Date(
                    checkpointAndComment.checkpoint.opening_date
                  ).toLocaleString('pt-BR')}
                </Text>
                <UnorderedList mt={10} ml={0}>
                  {checkpointAndComment.comments.map(comment => (
                    <ListItem key={comment.id} listStyleType='none'>
                      <Text>
                        {comment.author.name}: {comment.text}
                      </Text>
                      {/* <Text>Criador: {comment.author.name}</Text> */}
                    </ListItem>
                  ))}
                </UnorderedList>
              </Box>
            ))}
          </>
        ) }
    </>
      
  );
}
