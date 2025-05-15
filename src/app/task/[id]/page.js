// "use client";

// import { useParams } from "next/navigation";
// import {
//   useGetTasksQuery,
//   useCreateTaskMutation,
//   useDeleteTaskMutation,
//   useUpdateTaskMutation,
// } from "../../redux/api/taskApi";
// import { useFormik } from "formik";
// import { useState } from "react";

// const TaskManagement = () => {
//   const { id } = useParams();

//   const { data: tasks, isLoading } = useGetTasksQuery(id);
//   const [createTask] = useCreateTaskMutation();
//   const [deleteTask] = useDeleteTaskMutation();
//   const [updateTask] = useUpdateTaskMutation();

//   const [isUpdated, setIsUpdated] = useState(false);

//   const formikTask = useFormik({
//     initialValues: {
//       title: "",
//       status: "pending",
//       description: "",
//     },
//     onSubmit: async (values, { resetForm }) => {
//       try {
//         await createTask({ ...values, userId: id });
//         resetForm();
//       } catch (error) {
//         console.error("Failed to create task", error);
//       }
//     },
//   });

//   return (
//     <div>
//       <h1>Tasks for User: {id}</h1>

//       <form onSubmit={formikTask.handleSubmit}>
//         <input
//           type="text"
//           name="title"
//           value={formikTask.values.title}
//           onChange={formikTask.handleChange}
//           placeholder="Task Title"
//         />

//         <textarea
//           name="description"
//           value={formikTask.values.description}
//           onChange={formikTask.handleChange}
//           rows={5}
//           placeholder="Task Description"
//         />

//         <label htmlFor="status">Status</label>
//         <select
//           name="status"
//           id="status"
//           value={formikTask.values.status}
//           onChange={formikTask.handleChange}
//         >
//           <option value="pending">Pending</option>
//           <option value="in-progress">In Progress</option>
//           <option value="completed">Completed</option>
//           <option value="hold">On Hold</option>
//         </select>

//         <button type="submit">Create Task</button>
//       </form>

//       {isLoading ? (
//         <p>Loading tasks...</p>
//       ) : (
//         <ul>
//           {tasks?.data?.length > 0 &&
//             tasks?.data?.map((task) => (
//               <li key={task.id}>
//                 <strong>{task.title}</strong> - {task.status}
//                 <button onClick={() => deleteTask(task.id)}>Delete</button>
//               </li>
//             ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default TaskManagement;
"use client";

import { useParams } from "next/navigation";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from "../../redux/api/taskApi";
import { useFormik } from "formik";
import { useState } from "react";

const TaskManagement = () => {
  //   const { id } = useParams();

  //   console.log(id);

  //   const { data: tasks, isLoading, isError, refetch } = useGetTasksQuery(id);
  const { id: userId } = useParams();
  const [page, setPage] = useState(1);
  const limit = 10;

  // Don't call API if userId is undefined
  const {
    data: tasks,
    isLoading,
    isError,
    refetch,
  } = useGetTasksQuery(userId ? { userId, page, limit } : skipToken);
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [updateTask] = useUpdateTaskMutation();

  const [isUpdated, setIsUpdated] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);

  const formikTask = useFormik({
    initialValues: {
      title: "",
      status: "pending",
      description: "",
    },
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (isUpdated && editTaskId) {
          await updateTask({ id: editTaskId, data: values }).unwrap();
        } else {
          await createTask({ ...values, userId: userId }).unwrap();
        }
        resetForm();
        setIsUpdated(false);
        setEditTaskId(null);
        refetch(); // refresh tasks
      } catch (error) {
        console.error("Task operation failed", error);
      }
    },
  });

  const handleEdit = (task) => {
    // console.log(task);
    setIsUpdated(true);
    setEditTaskId(task._id);
    formikTask.setValues({
      title: task.title,
      status: task.status,
      description: task.description || "",
      userId: task.userId,
    });
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId).unwrap();
      refetch(); // refresh tasks
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Tasks for User: {userId}</h1>

      <form onSubmit={formikTask.handleSubmit} className="space-y-4 mb-6">
        <input
          type="text"
          name="title"
          value={formikTask.values.title}
          onChange={formikTask.handleChange}
          placeholder="Task Title"
          required
          className="w-full p-2 border rounded"
        />

        <textarea
          name="description"
          value={formikTask.values.description}
          onChange={formikTask.handleChange}
          rows={4}
          placeholder="Task Description"
          className="w-full p-2 border rounded"
        />

        <select
          name="status"
          value={formikTask.values.status}
          onChange={formikTask.handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="hold">On Hold</option>
        </select>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {isUpdated ? "Update Task" : "Create Task"}
          </button>
          {isUpdated && (
            <button
              type="button"
              onClick={() => {
                setIsUpdated(false);
                setEditTaskId(null);
                formikTask.resetForm();
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {isLoading ? (
        <p>Loading tasks...</p>
      ) : isError ? (
        <p className="text-red-600">Failed to load tasks.</p>
      ) : tasks?.data?.length > 0 ? (
        <ul className="space-y-3">
          {tasks.data.map((task) => (
            <li
              key={task._id}
              className="p-3 border rounded flex justify-between items-center"
            >
              <div>
                <strong>{task.title}</strong> -{" "}
                <span className="italic text-sm">{task.status}</span>
                <p className="text-gray-600">{task.description}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tasks found.</p>
      )}
    </div>
  );
};

export default TaskManagement;
