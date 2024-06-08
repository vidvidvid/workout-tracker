import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  List,
  ListItem,
  Text,
  Checkbox,
  Switch,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { fetchWorkouts, logProgress, fetchProgress } from "./firebaseFunctions";

const WeeklySchedule = () => {
  const [workouts, setWorkouts] = useState([]);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [progress, setProgress] = useState({});
  console.log("progress", progress);
  const currentDay = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
  });

  useEffect(() => {
    loadWorkouts();
    loadProgress();
  }, []);

  const loadWorkouts = async () => {
    const workoutsFromFirebase = await fetchWorkouts();
    setWorkouts(workoutsFromFirebase);
  };

  const loadProgress = async () => {
    const currentYear = new Date().getFullYear();
    const currentWeek = getWeekNumber(new Date());
    const progressData = await fetchProgress(currentYear, currentWeek);
    setProgress(progressData || {});
  };

  const getWeekNumber = (date) => {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil(days / 7);
  };

  const handleCheckboxChange = (day, workoutId, repIndex) => {
    const existingDays = ["Monday", "Tuesday", "Thursday", "Friday"];
    const currentDay = new Date().toLocaleDateString("en-GB", {
      weekday: "long",
    });
    if (!existingDays.includes(currentDay)) return;

    const currentYear = new Date().getFullYear();
    const currentWeek = getWeekNumber(new Date());

    const updatedProgress = { ...progress };
    if (!updatedProgress[currentYear]) {
      updatedProgress[currentYear] = {};
    }
    if (!updatedProgress[currentYear][currentWeek]) {
      updatedProgress[currentYear][currentWeek] = {};
    }
    if (!updatedProgress[currentYear][currentWeek][currentDay]) {
      updatedProgress[currentYear][currentWeek][currentDay] = {};
    }
    if (!updatedProgress[currentYear][currentWeek][currentDay][workoutId]) {
      updatedProgress[currentYear][currentWeek][currentDay][workoutId] = [];
    }

    const existingReps =
      updatedProgress[currentYear][currentWeek][currentDay][workoutId];
    while (existingReps.length <= repIndex) {
      existingReps.push(false);
    }
    existingReps[repIndex] = !existingReps[repIndex];

    setProgress(updatedProgress);
    logProgress(
      currentYear,
      currentWeek,
      currentDay,
      workoutId,
      repIndex,
      existingReps
    );
  };

  return (
    <Box p={5}>
      <VStack spacing={4}>
        <Heading>Weekly Schedule</Heading>
        <FormControl display='flex' alignItems='center'>
          <FormLabel htmlFor='show-today-only' mb='0'>
            Show Today's Workouts Only
          </FormLabel>
          <Switch
            id='show-today-only'
            isChecked={showTodayOnly}
            onChange={() => setShowTodayOnly(!showTodayOnly)}
          />
        </FormControl>
        <List spacing={3} w='100%'>
          {["Monday", "Tuesday", "Thursday", "Friday"].map((day) => (
            <Box key={day}>
              {(!showTodayOnly || day === currentDay) && (
                <>
                  <Heading size='lg'>{day}</Heading>
                  {workouts
                    .filter((workout) => workout.day === day)
                    .map((workout, i) => (
                      <ListItem
                        key={workout.id}
                        p={2}
                        border='1px solid'
                        borderRadius='md'
                      >
                        <Heading size='md'>{workout.name}</Heading>
                        <Text fontWeight='bold'>
                          <a
                            href={workout.link}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {workout.exercise}
                          </a>
                        </Text>
                        <List>
                          {workout.reps.map((rep, j) => (
                            <ListItem key={rep.value}>
                              <Checkbox
                                isChecked={
                                  progress[new Date().getFullYear()]?.[
                                    getWeekNumber(new Date())
                                  ]?.[day]?.[workout.id]?.[j] || false
                                }
                                onChange={() =>
                                  handleCheckboxChange(day, workout.id, j)
                                }
                              >
                                {rep.value
                                  ? `${rep.value} kg`
                                  : `${(
                                      rep.multiplier * workout.oneRepMax
                                    ).toFixed(1)} kg`}{" "}
                                x {rep.reps}
                              </Checkbox>
                            </ListItem>
                          ))}
                        </List>
                        <List>
                          {workout.tips.map((tip, k) => (
                            <ListItem key={tip}>
                              <Text as='i'>{tip}</Text>
                            </ListItem>
                          ))}
                        </List>
                      </ListItem>
                    ))}
                </>
              )}
            </Box>
          ))}
        </List>
      </VStack>
    </Box>
  );
};

export default WeeklySchedule;
