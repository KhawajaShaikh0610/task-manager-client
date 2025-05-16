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
import { Spinner, Table, Button, Pagination } from "react-bootstrap";
import { skipToken } from "@reduxjs/toolkit/query";
import * as Yup from "yup";

const TaskManagement = () => {
  const { id: userId } = useParams();
  const [page, setPage] = useState(1);
  const limit = 5;

  const {
    data: response,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetTasksQuery(userId ? { userId, page, limit } : skipToken);

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [updateTask] = useUpdateTaskMutation();

  const [isUpdated, setIsUpdated] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);

  const tasks = response?.data || [];
  const pagination = response?.pagination || {
    currentPage: 1,
    itemsPerPage: limit,
    totalItems: 0,
    totalPages: 1,
  };

  const formikTask = useFormik({
    initialValues: {
      title: "",
      status: "pending",
      description: "",
      userId: userId,
    },
    validationSchema: Yup.object().shape({
      title: Yup.string()
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title cannot exceed 100 characters")
        .required("Title is required"),
      description: Yup.string().max(
        500,
        "Description cannot exceed 500 characters"
      ),
      status: Yup.string()
        .oneOf(
          ["pending", "in-progress", "completed", "hold"],
          "Invalid status value"
        )
        .required("Status is required"),
      userId: Yup.string().required("User ID is required"),
    }),
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (isUpdated && editTaskId) {
          await updateTask({ id: editTaskId, data: values }).unwrap();
        } else {
          await createTask({ ...values }).unwrap();
        }
        resetForm();
        setIsUpdated(false);
        setEditTaskId(null);
        refetch();
      } catch (error) {
        console.error("Task operation failed", error);
      }
    },
  });

  // console.log(formikTask);
  const handleEdit = (task) => {
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
      refetch();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={formikTask.handleSubmit} className="space-y-3 mb-6">
        <div>
          <input
            type="text"
            name="title"
            placeholder="Task Title"
            className="w-full border rounded p-2"
            value={formikTask.values.title}
            onChange={formikTask.handleChange}
            required
          />
          {formikTask.touched.title && formikTask.errors.title && (
            <div className="text-red-500 text-sm mt-1">
              {formikTask.errors.title}
            </div>
          )}
        </div>

        <div>
          <textarea
            name="description"
            placeholder="Description"
            rows={3}
            className="w-full border rounded p-2"
            value={formikTask.values.description}
            onChange={formikTask.handleChange}
          />
          {formikTask.touched.description && formikTask.errors.description && (
            <div className="text-red-500 text-sm mt-1">
              {formikTask.errors.description}
            </div>
          )}
        </div>

        <div>
          <select
            name="status"
            className="w-full border rounded p-2"
            value={formikTask.values.status}
            onChange={formikTask.handleChange}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="hold">On Hold</option>
          </select>
          {formikTask.touched.status && formikTask.errors.status && (
            <div className="text-red-500 text-sm mt-1">
              {formikTask.errors.status}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type={"submit"}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={isCreating}
          >
            {isUpdated ? "Update Task" : "Create Task"}
            {isCreating && <Spinner size="sm" className="ms-2" />}
          </button>
          {isUpdated && (
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => {
                setIsUpdated(false);
                setEditTaskId(null);
                formikTask.resetForm();
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {isLoading || isFetching ? (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" />
        </div>
      ) : isError ? (
        <div className="alert alert-danger my-4">
          Error loading tasks. Please try again.
        </div>
      ) : tasks.length > 0 ? (
        <>
          <div className="table-responsive mb-4">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={task._id}>
                    <td>{(page - 1) * limit + index + 1}</td>
                    <td>{task.title}</td>
                    <td>{task.description}</td>
                    <td className="text-capitalize">{task.status}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEdit(task)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(task._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center">
              <Pagination>
                <Pagination.Prev
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                />

                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((number) => (
                  <Pagination.Item
                    key={number}
                    active={number === page}
                    onClick={() => setPage(number)}
                  >
                    {number}
                  </Pagination.Item>
                ))}

                <Pagination.Next
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="alert alert-info my-4">
          No tasks found. Create your first task!
        </div>
      )}
    </div>
  );
};

export default TaskManagement;

// export default TaskManagement;
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
//   //   const { id } = useParams();

//   //   console.log(id);

//   //   const { data: tasks, isLoading, isError, refetch } = useGetTasksQuery(id);
//   const { id: userId } = useParams();
//   const [page, setPage] = useState(1);
//   const limit = 10;

//   // Don't call API if userId is undefined
//   const {
//     data: tasks,
//     isLoading,
//     isError,
//     refetch,
//   } = useGetTasksQuery(userId ? { userId, page, limit } : skipToken);
//   const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
//   const [deleteTask] = useDeleteTaskMutation();
//   const [updateTask] = useUpdateTaskMutation();

//   const [isUpdated, setIsUpdated] = useState(false);
//   const [editTaskId, setEditTaskId] = useState(null);

//   const formikTask = useFormik({
//     initialValues: {
//       title: "",
//       status: "pending",
//       description: "",
//     },
//     enableReinitialize: true,
//     onSubmit: async (values, { resetForm }) => {
//       try {
//         if (isUpdated && editTaskId) {
//           await updateTask({ id: editTaskId, data: values }).unwrap();
//         } else {
//           await createTask({ ...values, userId: userId }).unwrap();
//         }
//         resetForm();
//         setIsUpdated(false);
//         setEditTaskId(null);
//         refetch(); // refresh tasks
//       } catch (error) {
//         console.error("Task operation failed", error);
//       }
//     },
//   });

//   const handleEdit = (task) => {
//     // console.log(task);
//     setIsUpdated(true);
//     setEditTaskId(task._id);
//     formikTask.setValues({
//       title: task.title,
//       status: task.status,
//       description: task.description || "",
//       userId: task.userId,
//     });
//   };

//   const handleDelete = async (taskId) => {
//     try {
//       await deleteTask(taskId).unwrap();
//       refetch(); // refresh tasks
//     } catch (error) {
//       console.error("Delete failed", error);
//     }
//   };

//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <h1 className="text-2xl font-semibold mb-4">Tasks for User: {userId}</h1>

//       <form onSubmit={formikTask.handleSubmit} className="space-y-4 mb-6">
//         <input
//           type="text"
//           name="title"
//           value={formikTask.values.title}
//           onChange={formikTask.handleChange}
//           placeholder="Task Title"
//           required
//           className="w-full p-2 border rounded"
//         />

//         <textarea
//           name="description"
//           value={formikTask.values.description}
//           onChange={formikTask.handleChange}
//           rows={4}
//           placeholder="Task Description"
//           className="w-full p-2 border rounded"
//         />

//         <select
//           name="status"
//           value={formikTask.values.status}
//           onChange={formikTask.handleChange}
//           className="w-full p-2 border rounded"
//         >
//           <option value="pending">Pending</option>
//           <option value="in-progress">In Progress</option>
//           <option value="completed">Completed</option>
//           <option value="hold">On Hold</option>
//         </select>

//         <div className="flex gap-3">
//           <button
//             type="submit"
//             className="bg-blue-600 text-white px-4 py-2 rounded"
//           >
//             {isUpdated ? "Update Task" : "Create Task"}
//           </button>
//           {isUpdated && (
//             <button
//               type="button"
//               onClick={() => {
//                 setIsUpdated(false);
//                 setEditTaskId(null);
//                 formikTask.resetForm();
//               }}
//               className="bg-gray-500 text-white px-4 py-2 rounded"
//             >
//               Cancel Edit
//             </button>
//           )}
//         </div>
//       </form>

//       {isLoading ? (
//         <p>Loading tasks...</p>
//       ) : isError ? (
//         <p className="text-red-600">Failed to load tasks.</p>
//       ) : tasks?.data?.length > 0 ? (
//         <ul className="space-y-3">
//           {tasks.data.map((task) => (
//             <li
//               key={task._id}
//               className="p-3 border rounded flex justify-between items-center"
//             >
//               <div>
//                 <strong>{task.title}</strong> -{" "}
//                 <span className="italic text-sm">{task.status}</span>
//                 <p className="text-gray-600">{task.description}</p>
//               </div>
//               <div className="space-x-2">
//                 <button
//                   onClick={() => handleEdit(task)}
//                   className="text-blue-600"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDelete(task._id)}
//                   className="text-red-600"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No tasks found.</p>
//       )}
//     </div>
//   );
// };

// export default TaskManagement;
