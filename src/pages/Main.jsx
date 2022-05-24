import {
  Box, Heading, ListItem, Text, UnorderedList, Button
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import * as api from 'strateegia-api';
import MapList from '../components/MapList';
import ProjectList from '../components/ProjectList';

export default function Main() {
  const initialTextForCreate =
    'Questão 1: Opção 1.1; Opção 2.2;\nQuestão 2: Opção 2.1; Opção 2.2; Opção 2.3';

  const [selectedProject, setSelectedProject] = useState('');
  const [selectedMap, setSelectedMap] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [convergencePoints, setConvergencePoints] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [checkpointAndComments, setCheckpointAndComments] = useState(null);


  const handleSelectChange = e => {
    setSelectedProject(e.target.value);
  };

  const handleMapSelectChange = e => {
    setSelectedMap(e.target.value);
  };

  useEffect(() => {
    setConvergencePoints([]);
  }, [selectedProject]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const mapContents = await api.getMapById(accessToken, selectedMap);

        const checkpoints = mapContents.points.filter(
          point => point.point_type === 'CONVERSATION'
        );

        const requestsPopulatedCheckpoints = [];
        const requestsCheckpointsComments = [];

        checkpoints.forEach(checkpoint => {
          requestsPopulatedCheckpoints.push(
            api.getCheckpointById(accessToken, checkpoint.id)
          );
          requestsCheckpointsComments.push(
            api.getAllCheckpointCommentsByCheckpointId(
              accessToken,
              checkpoint.id
            )
          );
        });

        const responsesPopulatedCheckpoints = await Promise.all(
          requestsPopulatedCheckpoints
        );
        const responsesCheckpointsComments = await Promise.all(
          requestsCheckpointsComments
        );

        const _checkpointAndComments = [];

        responsesPopulatedCheckpoints.forEach(checkpoint => {
          _checkpointAndComments.push({
            checkpoint,
            comments: [],
          });
        });

        responsesCheckpointsComments.forEach(element => {
          element.content.forEach(comment => {
            const found = _checkpointAndComments.find(item => {
              return item.checkpoint.id === comment.checkpoint_id;
            });
            found.comments.push(comment);
          });
        });
        console.log(_checkpointAndComments);
        setCheckpointAndComments([..._checkpointAndComments]);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [selectedMap]);

  useEffect(() => {
    setAccessToken(localStorage.getItem('accessToken'));
  }, []);

  return (
    <Box padding={10}>
      <Heading as="h3" size="md" mb={3}>
        atas de reuniões
      </Heading>
      <ProjectList handleSelectChange={handleSelectChange} />
      <MapList
        projectId={selectedProject}
        handleSelectChange={handleMapSelectChange}
      />
      {/* <ConvergencePointList convergencePoints={convergencePoints} /> */}
      <CheckpointReport checkpointAndComments={checkpointAndComments} />
    </Box>
  );
}

function CheckpointReport({ checkpointAndComments }) {
  const headers = [
    {label: 'Conv. Point Description', key: 'description'},
    {label: 'Local', key: 'meeting_place'},
    {label: 'Date', key: 'opening_date'},
    {label: 'Comments', key: 'texts'},
    {label: 'Authors', key: 'authors'}
  ];

  
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
      return {...checkpoint[index], authors: cmt.map(({author}) => author ), texts: cmt.map(({text}) => text )};
    });

    // exportJSONData(checkpointCommentsCSV);

  return (
    <Box marginTop='8px'>
      {checkpointAndComments ? (
        <>
        <Box display='flex' justifyContent='flex-end'>
          <CSVLink data={checkpointCommentsCSV} headers={headers} filename='strateegia_conversation_points_report-csv.csv' >
            <Button
              size='xs'
              fontSize='14px'
              fontWeight='400'
              bg='#6c757d' 
              color='#fff'
              borderRadius='3px'
              _hover={{bg: '#5C636A'}}
              paddingBottom={'4px'}
              
              >
                csv
            </Button>
          </CSVLink>
          <Button
            m='2px'
            size='xs'
            fontSize='14px'
            fontWeight='400'
            bg='#6c757d' 
            color='#fff'
            borderRadius='3px'
            _hover={{bg: '#5C636A'}}
            paddingBottom={'4px'}
            onClick={() => exportJSONData(checkpointCommentsCSV)}
          >
            json
          </Button>
        </Box>
        {checkpointAndComments.map(checkpointAndComment => (
          <Box margin={10}>
            <strong>{checkpointAndComment.checkpoint.description}</strong>
            <p>local: {checkpointAndComment.checkpoint.meeting_place}</p>
            <p>
              data:{' '}
              {new Date(
                checkpointAndComment.checkpoint.opening_date
              ).toLocaleString('pt-BR')}
            </p>
            <UnorderedList margin={5}>
              {checkpointAndComment.comments.map(comment => (
                <ListItem key={comment.id}>
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
      ) : (
        <p>sem pontos de conversação</p>
      )}
    </Box>
  );
}

function ConvergencePointList({ convergencePoints }) {
  
  return (
    <Box>
      
      {convergencePoints.length > 0 ? (
        convergencePoints.map(convergencePoint =>
          convergencePoint.questions.map(question => (
            <Box margin={10}>
              <p key={question.id}>{question.text}</p>
              <UnorderedList margin={5}>
                {question.options.map(option => (
                  <ListItem key={option.id}>{option.text}</ListItem>
                ))}
              </UnorderedList>
            </Box>
          ))
        )
      ) : (
        <p>sem pontos de convergência</p>
      )}
    </Box>
  );
}

export const exportJSONData = (data) => {
  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(data)
  )}`;

  const link = document.createElement("a");
  link.href = jsonString;
  link.download = "strateegia_conversation_points_report-json.json";

  link.click();
}
