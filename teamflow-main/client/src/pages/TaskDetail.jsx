import clsx from "clsx";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { FaBug, FaTasks, FaThumbsUp, FaUser } from "react-icons/fa";
import { GrInProgress } from "react-icons/gr";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineDoneAll,
  MdOutlineMessage,
  MdOutlineSecurity,
  MdTaskAlt,
} from "react-icons/md";
import { RxActivityLog } from "react-icons/rx";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button, Loading, Tabs } from "../components";
import { TaskColor } from "../components/tasks";
import { useSelector } from "react-redux";
import {
  useChangeSubTaskStatusMutation,
  useChangeTaskStageMutation,
  useGetSingleTaskQuery,
  usePostTaskActivityMutation,
} from "../redux/slices/api/taskApiSlice";
import {
  PRIOTITYSTYELS,
  TASK_TYPE,
  getCompletedSubTasks,
  getInitials,
  getRelativeTime,
  getStageLabel,
} from "../utils";
import { FaSpinner } from "react-icons/fa";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const bgColor = {
  high: "bg-red-200",
  medium: "bg-yellow-200",
  low: "bg-blue-200",
};

const TABS = [
  { title: "Task Detail", icon: <FaTasks /> },
  { title: "Activities/Timeline", icon: <RxActivityLog /> },
];

const TASKTYPEICON = {
  commented: (
    <div className='w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white'>
      <MdOutlineMessage size={20} />
    </div>
  ),
  started: (
    <div className='w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white'>
      <FaThumbsUp size={20} />
    </div>
  ),
  assigned: (
    <div className='w-10 h-10 flex items-center justify-center rounded-full bg-gray-500 text-white'>
      <FaUser size={16} />
    </div>
  ),
  bug: (
    <div className='w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-red-600'>
      <FaBug size={20} />
    </div>
  ),
  completed: (
    <div className='w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white'>
      <MdOutlineDoneAll size={22} />
    </div>
  ),
  closed: (
    <div className='w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white'>
      <MdOutlineDoneAll size={22} />
    </div>
  ),
  "in progress": (
    <div className='w-10 h-10 flex items-center justify-center rounded-full bg-violet-600 text-white'>
      <GrInProgress size={18} />
    </div>
  ),
};

const act_types = [
  "Commented",
  "In Progress",
  "Completed",
  "Started",
  "Bug",
];

// Live updating comment timestamp component without page reload
const CommentTimestamp = ({ date }) => {
  const [relativeTime, setRelativeTime] = useState(() => getRelativeTime(date));

  useEffect(() => {
    setRelativeTime(getRelativeTime(date));

    // Update relative time every 15 seconds so "Just now" transitions to "1 minute ago", etc.
    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime(date));
    }, 15000);

    return () => clearInterval(interval);
  }, [date]);

  return (
    <span
      className='text-sm text-gray-500'
      title={date ? new Date(date).toLocaleString() : ""}
    >
      {relativeTime || "Just now"}
    </span>
  );
};

const Activities = ({ activity, id, refetch, canInteract }) => {
  const [selected, setSelected] = useState("Commented");
  const [text, setText] = useState("");

  const [postActivity, { isLoading }] = usePostTaskActivityMutation();

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error("Please enter a comment or description.");
      return;
    }

    try {
      const data = {
        type: selected?.toLowerCase(),
        activity: text,
      };
      const res = await postActivity({
        data,
        id,
      }).unwrap();
      setText("");
      toast.success(res?.message || "Activity recorded successfully.");
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err.error || "Failed to post activity.");
    }
  };

  const Card = ({ item, isConnected }) => {
    return (
      <div className={`flex space-x-4`}>
        <div className='flex flex-col items-center flex-shrink-0'>
          <div className='w-10 h-10 flex items-center justify-center'>
            {TASKTYPEICON[item?.type?.toLowerCase()] || TASKTYPEICON.commented}
          </div>
          {isConnected && (
            <div className='h-full flex items-center py-1'>
              <div className='w-0.5 bg-gray-200 h-full min-h-[40px]'></div>
            </div>
          )}
        </div>

        <div className='flex flex-col gap-y-1 mb-8 flex-1'>
          <p className='font-semibold text-gray-800'>{item?.by?.name || "System"}</p>
          <div className='text-gray-500 space-x-2 flex items-center'>
            <span className='capitalize font-medium text-gray-700'>{item?.type}</span>
            <span>•</span>
            <CommentTimestamp date={item?.date} />
          </div>
          <div className='text-gray-700 whitespace-pre-wrap mt-1'>{item?.activity}</div>
        </div>
      </div>
    );
  };

  return (
    <div className='w-full flex flex-col md:flex-row gap-10 min-h-[500px] px-6 md:px-10 py-8 bg-white shadow rounded-md justify-between overflow-y-auto'>
      <div className='w-full md:w-1/2'>
        <h4 className='text-gray-700 font-bold text-lg mb-6'>Activities & Comments</h4>
        <div className='w-full space-y-0'>
          {activity && activity.length > 0 ? (
            activity.map((item, index) => (
              <Card
                key={item._id || index}
                item={item}
                isConnected={index < activity.length - 1}
              />
            ))
          ) : (
            <p className='text-gray-500'>No activities or comments recorded yet.</p>
          )}
        </div>
      </div>

      <div className='w-full md:w-1/3'>
        <h4 className='text-gray-700 font-bold text-lg mb-4'>Add Comment / Activity</h4>
        <div className='w-full flex flex-col gap-4'>
          <div className='flex flex-wrap gap-3'>
            {act_types.map((item) => (
              <label
                key={item}
                className={clsx(
                  "cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                  selected === item
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                )}
              >
                <input
                  type='radio'
                  name='activityType'
                  className='hidden'
                  checked={selected === item}
                  onChange={() => setSelected(item)}
                />
                {item}
              </label>
            ))}
          </div>

          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Type your comment, update, or resolution notes here...'
            className='bg-white w-full border border-gray-300 outline-none p-3 rounded-md focus:ring-2 ring-blue-500 text-sm text-gray-800'
          ></textarea>

          {isLoading ? (
            <Loading />
          ) : (
            <Button
              type='button'
              label='Submit Activity'
              onClick={handleSubmit}
              className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded w-full'
            />
          )}
        </div>
      </div>
    </div>
  );
};

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data, isLoading, error, refetch } = useGetSingleTaskQuery(id);
  const [subTaskAction, { isLoading: isSubmitting }] =
    useChangeSubTaskStatusMutation();
  const [changeTaskStage, { isLoading: isChangingStage }] =
    useChangeTaskStageMutation();

  const [selected, setSelected] = useState(0);
  const task = data?.task;

  const handleStageChange = async (newStage) => {
    try {
      const res = await changeTaskStage({
        id: task?._id,
        stage: newStage,
      }).unwrap();

      toast.success(res?.message || `Status updated to ${getStageLabel(newStage)}.`);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err.error || "Failed to update status.");
    }
  };

  const handleSubmitAction = async (el) => {
    try {
      const data = {
        taskId: task?._id,
        subTaskId: el.subId,
        status: !el.status,
      };
      const res = await subTaskAction(data).unwrap();

      toast.success(res?.message);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  if (isLoading) {
    return (
      <div className='py-20 flex justify-center items-center'>
        <Loading />
      </div>
    );
  }

  // Strict issue-level access control UI feedback
  if (error) {
    return (
      <div className='w-full min-h-[60vh] flex flex-col items-center justify-center p-8 bg-white shadow rounded-md'>
        <div className='w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl mb-4'>
          <MdOutlineSecurity />
        </div>
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>
          {error?.status === 403 ? "Access Restricted" : "Issue Not Found"}
        </h2>
        <p className='text-gray-600 text-center max-w-md mb-6'>
          {error?.data?.message ||
            "You are not authorized to view this issue. Access is granted only to assigned users and administrators."}
        </p>
        <Button
          label='Back to Tasks'
          onClick={() => navigate("/tasks")}
          className='bg-blue-600 text-white rounded px-6 py-2.5 hover:bg-blue-700 font-medium'
        />
      </div>
    );
  }

  const isAssignee = task?.team?.some(
    (member) => (member._id || member).toString() === user?._id?.toString()
  );
  const canUpdateStatus = user?.isAdmin || isAssignee;

  const currentStageNorm = (task?.stage || "").toLowerCase();
  const displayStage = getStageLabel(task?.stage);

  const percentageCompleted =
    !task?.subTasks || task?.subTasks?.length === 0
      ? 0
      : (getCompletedSubTasks(task?.subTasks) / task?.subTasks?.length) * 100;

  return (
    <div className='w-full flex flex-col gap-4 mb-4'>
      {/* Title & Stage Controller */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-md shadow-sm'>
        <div>
          <span className='text-xs font-bold text-gray-400 uppercase tracking-wider'>
            Issue ID: {task?._id?.slice(-6)}
          </span>
          <h1 className='text-2xl font-bold text-gray-800'>{task?.title}</h1>
        </div>

        {/* Status Transition Control */}
        {canUpdateStatus && (
          <div className='flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200'>
            <span className='text-xs font-semibold text-gray-500 uppercase px-1'>
              Change Status:
            </span>
            <div className='flex gap-1.5'>
              <button
                type='button'
                disabled={isChangingStage || currentStageNorm === "todo" || currentStageNorm === "open"}
                onClick={() => handleStageChange("todo")}
                className={clsx(
                  "px-3 py-1 text-xs font-semibold rounded transition-all",
                  currentStageNorm === "todo" || currentStageNorm === "open"
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200 disabled:opacity-50"
                )}
              >
                Open
              </button>
              <button
                type='button'
                disabled={isChangingStage || currentStageNorm === "in progress"}
                onClick={() => handleStageChange("in progress")}
                className={clsx(
                  "px-3 py-1 text-xs font-semibold rounded transition-all",
                  currentStageNorm === "in progress"
                    ? "bg-yellow-600 text-white shadow"
                    : "bg-white text-gray-700 hover:bg-yellow-50 border border-gray-200 disabled:opacity-50"
                )}
              >
                In Progress
              </button>
              <button
                type='button'
                disabled={isChangingStage || currentStageNorm === "completed" || currentStageNorm === "closed"}
                onClick={() => handleStageChange("completed")}
                className={clsx(
                  "px-3 py-1 text-xs font-semibold rounded transition-all",
                  currentStageNorm === "completed" || currentStageNorm === "closed"
                    ? "bg-green-600 text-white shadow"
                    : "bg-white text-gray-700 hover:bg-green-50 border border-gray-200 disabled:opacity-50"
                )}
              >
                Closed
              </button>
            </div>
          </div>
        )}
      </div>

      <Tabs tabs={TABS} setSelected={setSelected}>
        {selected === 0 ? (
          <>
            <div className='w-full flex flex-col md:flex-row gap-5 2xl:gap-8 bg-white shadow rounded-md px-8 py-8'>
              <div className='w-full md:w-1/2 space-y-6'>
                <div className='flex items-center gap-4 flex-wrap'>
                  {/* Priority Badge */}
                  <div
                    className={clsx(
                      "flex gap-1 items-center text-sm font-semibold px-3 py-1 rounded-full",
                      PRIOTITYSTYELS[task?.priority],
                      bgColor[task?.priority]
                    )}
                  >
                    <span className='text-base'>{ICONS[task?.priority]}</span>
                    <span className='uppercase'>{task?.priority} Priority</span>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-sm font-semibold shadow-sm",
                      TASK_TYPE[task?.stage] || "bg-blue-600"
                    )}
                  >
                    <TaskColor className='bg-white' />
                    <span>{displayStage}</span>
                  </div>
                </div>

                <p className='text-gray-500 text-sm'>
                  Created: {new Date(task?.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                <div className='flex items-center gap-8 p-4 bg-gray-50 rounded border border-gray-200'>
                  <div className='space-x-2'>
                    <span className='font-semibold text-gray-700'>Assets:</span>
                    <span className='text-gray-900'>{task?.assets?.length || 0}</span>
                  </div>
                  <span className='text-gray-300'>|</span>
                  <div className='space-x-2'>
                    <span className='font-semibold text-gray-700'>Sub-Tasks:</span>
                    <span className='text-gray-900'>{task?.subTasks?.length || 0}</span>
                  </div>
                </div>

                {/* Assigned Users / Team */}
                <div className='space-y-3 py-2'>
                  <p className='text-gray-600 font-bold text-sm tracking-wide uppercase'>
                    Assigned Team ({task?.team?.length || 0})
                  </p>
                  <div className='space-y-2'>
                    {task?.team && task.team.length > 0 ? (
                      task.team.map((m, index) => (
                        <div
                          key={m?._id || index}
                          className='flex gap-3 py-2 px-3 items-center rounded-md bg-gray-50 border border-gray-200'
                        >
                          <div className='w-9 h-9 rounded-full text-white flex items-center justify-center text-xs font-bold bg-blue-600'>
                            <span>{getInitials(m?.name)}</span>
                          </div>
                          <div className='flex-1'>
                            <p className='text-sm font-semibold text-gray-800'>{m?.name}</p>
                            <span className='text-xs text-gray-500'>{m?.title || m?.role || m?.email}</span>
                          </div>
                          {m?._id?.toString() === user?._id?.toString() && (
                            <span className='text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded'>
                              You
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className='text-gray-400 text-sm italic'>No users assigned yet.</p>
                    )}
                  </div>
                </div>

                {/* Subtasks */}
                {task?.subTasks?.length > 0 && (
                  <div className='space-y-4 py-4 border-t border-gray-200'>
                    <div className='flex items-center gap-4'>
                      <p className='text-gray-600 font-bold text-sm uppercase'>
                        Sub-Tasks
                      </p>
                      <div
                        className={`w-fit h-7 px-2.5 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                          percentageCompleted < 50
                            ? "bg-rose-600"
                            : percentageCompleted < 80
                            ? "bg-amber-600"
                            : "bg-emerald-600"
                        }`}
                      >
                        <p>{percentageCompleted.toFixed(0)}% Completed</p>
                      </div>
                    </div>
                    <div className='space-y-3'>
                      {task?.subTasks?.map((el, index) => (
                        <div
                          key={el?._id || index}
                          className='flex items-start justify-between p-3 rounded-md border border-gray-200 bg-gray-50'
                        >
                          <div className='flex gap-3 items-center'>
                            <div className='w-8 h-8 flex items-center justify-center rounded-full bg-violet-100'>
                              <MdTaskAlt className='text-violet-600' size={20} />
                            </div>

                            <div className='space-y-0.5'>
                              <div className='flex gap-2 items-center'>
                                <span className='text-xs text-gray-500'>
                                  {new Date(el?.date).toLocaleDateString()}
                                </span>
                                {el?.tag && (
                                  <span className='px-2 py-0.5 text-xs rounded bg-violet-100 text-violet-700 font-medium'>
                                    {el?.tag}
                                  </span>
                                )}
                              </div>
                              <p className={clsx("text-sm font-medium", el?.isCompleted ? "line-through text-gray-400" : "text-gray-800")}>
                                {el?.title}
                              </p>
                            </div>
                          </div>

                          {canUpdateStatus && (
                            <button
                              disabled={isSubmitting}
                              className={clsx(
                                "text-xs font-semibold px-2.5 py-1 rounded transition-colors border",
                                el?.isCompleted
                                  ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                              )}
                              onClick={() =>
                                handleSubmitAction({
                                  status: el?.isCompleted,
                                  subId: el?._id,
                                })
                              }
                            >
                              {isSubmitting ? (
                                <FaSpinner className='animate-spin' />
                              ) : el?.isCompleted ? (
                                "Mark as Undone"
                              ) : (
                                "Mark as Done"
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column: Description, assets, links */}
              <div className='w-full md:w-1/2 space-y-6'>
                <div>
                  <p className='text-gray-700 font-bold text-sm uppercase mb-2'>
                    Issue Description
                  </p>
                  <div className='w-full p-4 bg-gray-50 rounded-md border border-gray-200 text-gray-700 whitespace-pre-wrap text-sm min-h-[100px]'>
                    {task?.description || "No description provided for this issue."}
                  </div>
                </div>

                {task?.assets?.length > 0 && (
                  <div>
                    <p className='text-gray-700 font-bold text-sm uppercase mb-2'>
                      Assets ({task.assets.length})
                    </p>
                    <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-3'>
                      {task.assets.map((el, index) => (
                        <img
                          key={index}
                          src={el}
                          alt={`Asset ${index + 1}`}
                          className='w-full rounded h-36 object-cover border border-gray-200 hover:shadow-md transition-shadow'
                        />
                      ))}
                    </div>
                  </div>
                )}

                {task?.links?.length > 0 && (
                  <div>
                    <p className='text-gray-700 font-bold text-sm uppercase mb-2'>
                      Support & Reference Links
                    </p>
                    <div className='w-full flex flex-col gap-2'>
                      {task.links.map((el, index) => (
                        <a
                          key={index}
                          href={el.startsWith("http") ? el : `https://${el}`}
                          target='_blank'
                          rel='noreferrer'
                          className='text-blue-600 hover:underline text-sm break-all'
                        >
                          {el}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <Activities
            activity={task?.activities}
            refetch={refetch}
            id={id}
            canInteract={canUpdateStatus}
          />
        )}
      </Tabs>
    </div>
  );
};

export default TaskDetail;
