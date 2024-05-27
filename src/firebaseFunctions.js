import database from "./firebase";
import { ref, set, push, get, child, update } from "firebase/database";
import initialWorkouts from "./initialWorkouts";

// Function to upload initial workouts to Firebase
export const uploadInitialWorkouts = async () => {
  try {
    const workoutsRef = ref(database, "workouts/");
    for (const workout of initialWorkouts) {
      const newWorkoutRef = push(workoutsRef);
      await set(newWorkoutRef, workout);
    }
    console.log("Initial workouts uploaded successfully!");
  } catch (error) {
    console.error("Error uploading initial workouts: ", error);
  }
};

// Function to fetch workouts from Firebase
export const fetchWorkouts = async () => {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, "workouts"));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.keys(data).map((key) => ({
      id: key,
      ...data[key],
    }));
  } else {
    return [];
  }
};

// Function to add a new workout to Firebase
export const addWorkoutToFirebase = async (workout) => {
  const workoutsRef = ref(database, "workouts/");
  const newWorkoutRef = push(workoutsRef);
  await set(newWorkoutRef, workout);
};

// Function to update an existing workout in Firebase
export const updateWorkoutInFirebase = async (id, updatedWorkout) => {
  const workoutRef = ref(database, `workouts/${id}`);
  await update(workoutRef, updatedWorkout);
};

export const logProgress = async (
  year,
  week,
  day,
  workoutId,
  repIndex,
  completedReps
) => {
  const progressRef = ref(
    database,
    `progress/${year}/${week}/${day}/${workoutId}`
  );
  const snapshot = await get(progressRef);
  let updatedReps = [];

  if (snapshot.exists()) {
    updatedReps = snapshot.val();
  }

  // Ensure the array is long enough to include the new index
  while (updatedReps.length <= repIndex) {
    updatedReps.push(false);
  }

  // Toggle the value at the specific index
  updatedReps[repIndex] = !updatedReps[repIndex];

  set(progressRef, updatedReps);
};

export const fetchProgress = async (year, week) => {
  const dbRef = ref(database, `progress/`);
  const snapshot = await get(dbRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return {};
};
