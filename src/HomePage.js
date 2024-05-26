import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  Heading,
  List,
  ListItem,
  Text,
  Checkbox,
  Input,
} from "@chakra-ui/react";
import { fetchWorkouts, updateWorkoutInFirebase } from "./firebaseFunctions";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [workouts, setWorkouts] = useState([]);
  const [currentDay, setCurrentDay] = useState(
    new Date().toLocaleDateString("en-US", { weekday: "long" })
  );
  const [checkedSets, setCheckedSets] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    const workoutsFromFirebase = await fetchWorkouts();
    setWorkouts(workoutsFromFirebase.filter((w) => w.day === currentDay));
  };

  const handleCheckboxChange = (exerciseId, setIndex) => {
    setCheckedSets((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [setIndex]: !prev[exerciseId]?.[setIndex],
      },
    }));
  };

  const handleOneRepMaxChange = async (id, newMax) => {
    const workoutToUpdate = workouts.find((w) => w.id === id);
    const adjustmentFactor = newMax / workoutToUpdate.oneRepMax;
    const updatedReps = workoutToUpdate.reps.map((rep) => {
      if (rep.value) {
        return { ...rep };
      }
      return {
        multiplier: (rep.multiplier * adjustmentFactor).toFixed(2),
        reps: rep.reps,
      };
    });
    const updatedWorkout = {
      ...workoutToUpdate,
      oneRepMax: newMax,
      reps: updatedReps,
    };
    await updateWorkoutInFirebase(id, updatedWorkout);
    loadWorkouts();
  };

  return (
    <Box p={5}>
      <VStack spacing={4}>
        <Heading>Today's Workout - {currentDay}</Heading>
        <Button onClick={() => navigate("/weekly-schedule")}>
          Weekly Schedule
        </Button>
        <List spacing={3} w='100%'>
          {workouts.map((workout, index) => (
            <ListItem key={index} p={2} border='1px solid' borderRadius='md'>
              <Heading size='md'>{workout.name}</Heading>
              <Text>
                <a
                  href={workout.link}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Link
                </a>
              </Text>
              <Text>1 Rep Max: {workout.oneRepMax} kg</Text>
              <List>
                {workout.reps.map((rep, i) => (
                  <ListItem key={i}>
                    <Checkbox
                      isChecked={checkedSets[workout.id]?.[i] || false}
                      onChange={() => handleCheckboxChange(workout.id, i)}
                    >
                      {rep.value
                        ? `${rep.value} kg`
                        : `${(rep.multiplier * workout.oneRepMax).toFixed(
                            1
                          )} kg`}{" "}
                      x {rep.reps}
                    </Checkbox>
                  </ListItem>
                ))}
              </List>
              <List>
                {workout.tips.map((tip, i) => (
                  <ListItem key={i}>
                    <Text as='i'>{tip}</Text>
                  </ListItem>
                ))}
              </List>
              <Input
                placeholder='Update 1 Rep Max'
                onChange={(e) =>
                  handleOneRepMaxChange(workout.id, parseFloat(e.target.value))
                }
              />
            </ListItem>
          ))}
        </List>
      </VStack>
    </Box>
  );
};

export default HomePage;
