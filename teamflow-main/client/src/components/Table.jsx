import clsx from "clsx";
import { useState } from "react";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { toast } from "sonner";
import { useTrashTastMutation } from "../redux/slices/api/taskApiSlice.js";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, formatDate, getStageLabel } from "../utils/index.js";
import { useSelector } from "react-redux";
import { Button, ConfirmatioDialog, UserInfo } from "./index";
import { AddTask, TaskAssets, TaskColor } from "./tasks";
import { Link } from "react-router-dom";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const Table = ({ tasks }) => {
  const { user } = useSelector((state) => state.auth);
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);

  const [deleteTask] = useTrashTastMutation();

  const deleteClicks = (id) => {
    setSelected(id);
    setOpenDialog(true);
  };

  const editClickHandler = (el) => {
    setSelected(el);
    setOpenEdit(true);
  };

  const deleteHandler = async () => {
    try {
      const res = await deleteTask({
        id: selected,
        isTrashed: "trash",
      }).unwrap();

      toast.success(res?.message || "Task moved to trash successfully.");
      setOpenDialog(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err.error || "Failed to delete task.");
    }
  };

  const TableHeader = () => (
    <thead className='w-full border-b border-gray-300 dark:border-gray-600'>
      <tr className='w-full text-black dark:text-white text-left'>
        <th className='py-2'>Task Title</th>
        <th className='py-2'>Status</th>
        <th className='py-2'>Priority</th>
        <th className='py-2 line-clamp-1'>Created At</th>
        <th className='py-2'>Assets</th>
        <th className='py-2'>Team</th>
        <th className='py-2 text-right'>Action</th>
      </tr>
    </thead>
  );

  const TableRow = ({ task }) => (
    <tr className='border-b border-gray-200 text-gray-600 hover:bg-gray-300/10'>
      <td className='py-2'>
        <Link to={`/task/${task._id}`}>
          <div className='flex items-center gap-2'>
            <TaskColor className={TASK_TYPE[task.stage]} />
            <p className='w-full line-clamp-2 text-base text-black dark:text-white font-medium hover:text-blue-600'>
              {task?.title}
            </p>
          </div>
        </Link>
      </td>

      <td className='py-2'>
        <span
          className={clsx(
            "px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm inline-block",
            TASK_TYPE[task?.stage] || "bg-blue-600"
          )}
        >
          {getStageLabel(task?.stage)}
        </span>
      </td>

      <td className='py-2'>
        <div className={"flex gap-1 items-center"}>
          <span className={clsx("text-lg", PRIOTITYSTYELS[task?.priority])}>
            {ICONS[task?.priority]}
          </span>
          <span className='capitalize line-clamp-1'>
            {task?.priority} Priority
          </span>
        </div>
      </td>

      <td className='py-2'>
        <span className='text-sm text-gray-600'>
          {formatDate(new Date(task?.date))}
        </span>
      </td>

      <td className='py-2'>
        <TaskAssets
          activities={task?.activities?.length}
          subTasks={task?.subTasks}
          assets={task?.assets?.length}
        />
      </td>

      <td className='py-2'>
        <div className='flex'>
          {task?.team?.map((m, index) => (
            <div
              key={m?._id || index}
              className={clsx(
                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                BGS[index % BGS?.length]
              )}
            >
              <UserInfo user={m} />
            </div>
          ))}
        </div>
      </td>

      <td className='py-2 flex gap-2 md:gap-3 justify-end items-center'>
        <Link
          to={`/task/${task._id}`}
          className='text-blue-600 hover:text-blue-800 text-sm font-semibold'
        >
          Open
        </Link>

        {user?.isAdmin && (
          <>
            <Button
              className='text-gray-600 hover:text-gray-900 sm:px-0 text-sm'
              label='Edit'
              type='button'
              onClick={() => editClickHandler(task)}
            />

            <Button
              className='text-red-600 hover:text-red-800 sm:px-0 text-sm'
              label='Delete'
              type='button'
              onClick={() => deleteClicks(task._id)}
            />
          </>
        )}
      </td>
    </tr>
  );

  return (
    <>
      <div className='bg-white px-2 md:px-4 pt-4 pb-9 shadow-md rounded'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <TableHeader />
            <tbody>
              {tasks && tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <TableRow key={task?._id || index} task={task} />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className='text-center py-8 text-gray-500'>
                    No issues found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />

      <AddTask
        open={openEdit}
        setOpen={setOpenEdit}
        task={selected}
        key={selected?._id || new Date().getTime()}
      />
    </>
  );
};

export default Table;
