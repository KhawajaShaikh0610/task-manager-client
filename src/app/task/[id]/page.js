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
import { Spinner, Table, Button, Pagination, Row, Col } from "react-bootstrap";
import { skipToken } from "@reduxjs/toolkit/query";
import * as Yup from "yup";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const TaskManagement = () => {
  const { id: userId } = useParams();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
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

  // Filter tasks based on status
  const filteredTasks =
    statusFilter === "all"
      ? tasks
      : tasks.filter((task) => task.status === statusFilter);

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
          toast.success("Task updated successfully");
        } else {
          await createTask({ ...values }).unwrap();
          toast.success("Task created successfully");
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
      toast.success("Task deleted successfully");

      refetch();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1); // Reset to first page when changing filters
  };

  const getCookieData = (cookieName) => {
    const cookieValue = Cookies.get(cookieName);
    try {
      return cookieValue ? JSON.parse(cookieValue) : null;
    } catch (error) {
      console.error(`Error parsing ${cookieName} cookie:`, error);
      return null;
    }
  };

  const router = useRouter();

  const existingUser = getCookieData("user");

  const handleLogout = () => {
    Cookies.remove("user");
    router.push("/");
    console.log("Logout clicked");
    toast.success("User logged out successfully");
  };

  return (
    <div>
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">Task Manager</h1>
          </div>
          <div className="header-right">
            <span className="user-greeting">
              Hi, {existingUser?.user?.name}
            </span>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <div className="task-management-container">
        <div className="task-form-container">
          <h2 className="form-title">
            {isUpdated ? "Update Task" : "Create New Task"}
          </h2>

          <form onSubmit={formikTask.handleSubmit} className="task-form">
            <Row>
              <Col md={6}>
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Task Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    placeholder="Enter task title"
                    className={`form-input ${
                      formikTask.touched.title && formikTask.errors.title
                        ? "input-error"
                        : ""
                    }`}
                    value={formikTask.values.title}
                    onChange={formikTask.handleChange}
                    onBlur={formikTask.handleBlur}
                  />
                  {formikTask.touched.title && formikTask.errors.title && (
                    <div className="error-message">
                      {formikTask.errors.title}
                    </div>
                  )}
                </div>
              </Col>
              <Col md={6}>
                <div className="form-group">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className={`form-input ${
                      formikTask.touched.status && formikTask.errors.status
                        ? "input-error"
                        : ""
                    }`}
                    value={formikTask.values.status}
                    onChange={formikTask.handleChange}
                    onBlur={formikTask.handleBlur}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="hold">On Hold</option>
                  </select>
                  {formikTask.touched.status && formikTask.errors.status && (
                    <div className="error-message">
                      {formikTask.errors.status}
                    </div>
                  )}
                </div>
              </Col>

              <Col md={12}>
                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Enter task description"
                    rows={3}
                    className={`form-input ${
                      formikTask.touched.description &&
                      formikTask.errors.description
                        ? "input-error"
                        : ""
                    }`}
                    value={formikTask.values.description}
                    onChange={formikTask.handleChange}
                    onBlur={formikTask.handleBlur}
                  />
                  {formikTask.touched.description &&
                    formikTask.errors.description && (
                      <div className="error-message">
                        {formikTask.errors.description}
                      </div>
                    )}
                </div>
              </Col>

              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <span className="button-loading">
                      <span className="spinner"></span>
                      {isUpdated ? "Updating..." : "Creating..."}
                    </span>
                  ) : isUpdated ? (
                    "Update Task"
                  ) : (
                    "Create Task"
                  )}
                </button>

                {isUpdated && (
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setIsUpdated(false);
                      setEditTaskId(null);
                      formikTask.resetForm();
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </Row>
          </form>
        </div>

        <div className="task-list-container">
          {isLoading || isFetching ? (
            <div className="loading-container">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : isError ? (
            <div className="alert alert-error">
              Error loading tasks. Please try again.
            </div>
          ) : tasks.length > 0 ? (
            <>
              <div className="table-filter-container">
                <div className="status-filter">
                  <label htmlFor="status-filter" className="filter-label">
                    Filter by Status:
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    className="filter-select"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="task-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task, index) => (
                      <tr key={task._id}>
                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>{task.title}</td>
                        <td>{task.description || "-"}</td>
                        <td>
                          <span className={`status-badge ${task.status}`}>
                            {task.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-button"
                              onClick={() => handleEdit(task)}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-button"
                              onClick={() => handleDelete(task._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {statusFilter === "all" && (
                <div>
                  {pagination.totalPages > 1 && (
                    <div className="pagination-container">
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
                            setPage((p) =>
                              Math.min(pagination.totalPages, p + 1)
                            )
                          }
                          disabled={page === pagination.totalPages}
                        />
                      </Pagination>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              No tasks found. Create your first task!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;
