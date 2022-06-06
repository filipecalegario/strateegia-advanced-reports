import { Box, Link } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import * as api from 'strateegia-api';
import MapList from '../components/MapList';
import ProjectList from '../components/ProjectList';
import Loading from "../components/Loading";
import { CheckpointReport } from '../components/CheckpointReport';
import { i18n } from "../translate/i18n";

export default function Main() {
  const initialTextForCreate =
    'Questão 1: Opção 1.1; Opção 2.2;\nQuestão 2: Opção 2.1; Opção 2.2; Opção 2.3';

  const [selectedProject, setSelectedProject] = useState('');
  const [selectedMap, setSelectedMap] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [convergencePoints, setConvergencePoints] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [checkpointAndComments, setCheckpointAndComments] = useState(null);
  const [projectData, setProjectData] = useState(null);


  const handleSelectChange = (e) => {
    setSelectedProject(e.target.value);
    setIsLoading(true);
    async function fetchMapList() {
      try {
        const project = await api.getProjectById(accessToken, e.target.value);
        setProjectData(project);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    }
    fetchMapList();
  };

  const handleMapSelectChange = e => {
    e.target.value === '0' ? setSelectedMap(projectData.maps) : setSelectedMap(e.target.value);
  };

  useEffect(() => {
    setConvergencePoints([]);
  }, [selectedProject]);
  



  useEffect(() => {
    setCheckpointAndComments([])
    async function readMapContents (id) {
      const mapContents = await api.getMapById(accessToken, id);
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
      setCheckpointAndComments(checkP => [...checkP, ..._checkpointAndComments]);
    }


    async function fetchData() {
      try {
        setIsLoading(true);

        if (typeof selectedMap === 'object') {

          selectedMap.map( async ({id}) => {
            
            await readMapContents(id);
          })

        } else await readMapContents(selectedMap);
        
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
      <Box display='flex' >
        <ProjectList handleSelectChange={handleSelectChange} />
        <Link 
          pointerEvents={selectedProject ? '' : 'none'}
          _disabled={selectedProject ? false : true}
          href={selectedProject ? `https://app.strateegia.digital/journey/${selectedProject}/map/${projectData?.maps[0].id}` : '' }
          target='_blank'
          bg='#E9ECEF'
          borderRadius={' 0 6px 6px 0 '}
          fontSize={16}
          w={200} h='40px'
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          {i18n.t('main.link')}
        </Link>
      </Box>
      <MapList
        projectId={selectedProject}
        handleSelectChange={handleMapSelectChange}
      />
      {/* <ConvergencePointList convergencePoints={convergencePoints} /> */}
      <Loading active={isLoading} /> 
      <CheckpointReport checkpointAndComments={checkpointAndComments} />
    </Box>
  );
}
