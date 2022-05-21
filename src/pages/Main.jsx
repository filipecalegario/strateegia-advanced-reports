import {
  Box,
  List,
  ListItem,
  ListIcon,
  UnorderedList,
  Switch,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
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
  return (
    <Box>
      {checkpointAndComments ? (
        checkpointAndComments.map(checkpointAndComment => (
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
                  <Text>{comment.text}</Text>
                  <Text>{comment.author.name}</Text>
                </ListItem>
              ))}
            </UnorderedList>
          </Box>
        ))
      ) : (
        <p>sem pontos de convergência</p>
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
