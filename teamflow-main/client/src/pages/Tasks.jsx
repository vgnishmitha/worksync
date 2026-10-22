import React, { useEffect, useState } from "react";
import { FaList } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { MdGridView } from "react-icons/md";
import { useParams, useSearchParams } from "react-router-dom";
import { Button, Loading, Table, Tabs, Title } from "../components";
import { AddTask, BoardView, TaskTitle } from "../components/tasks";
import { useGetAllTaskQuery } from "../redux/slices/api/taskApiSlice";
import { TASK_TYPE, getStageLabel } from "../utils";
import { useSelector } from "react-redux";

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
];

const Tasks = () => {
  const params = useParams();
  const { user } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);

  const rawStatus = params?.status || "";
  const displayStatus = rawStatus ? getStageLabel(rawStatus) : "";

  const { data, isLoading, refetch } = useGetAllTaskQuery({
    strQuery: rawStatus,
    isTrashed: "",
    search: searchTerm,
  });

  useEffect(() => {
    refetch();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [open, searchTerm, rawStatus, refetch]);

  return isLoading ? (
    <div className='py-10 flex justify-center'>
      <Loading />
    </div>
  ) : (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-4'>
        <Title
          title={
            displayStatus
              ? `${displayStatus} Issues`
              : user?.isAdmin
              ? "All Issues"
              : "My Assigned Issues"
          }
        />

        {user?.isAdmin && (
          <Button
            label='Create Issue'
            icon={<IoMdAdd className='text-lg' />}
            className='flex flex-row-reverse gap-1 items-center bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-4 font-semibold text-sm'
            onClick={() => setOpen(true)}
          />
        )}
      </div>

      <div>
        <Tabs tabs={TABS} setSelected={setSelected}>
          {!rawStatus && (
            <div className='w-full flex justify-between gap-4 md:gap-x-12 py-4'>
              <TaskTitle label='Open' className={TASK_TYPE.open} />
              <TaskTitle
                label='In Progress'
                className={TASK_TYPE["in progress"]}
              />
              <TaskTitle label='Closed' className={TASK_TYPE.closed} />
            </div>
          )}

          {selected === 0 ? (
            <BoardView tasks={data?.tasks} />
          ) : (
            <Table tasks={data?.tasks} />
          )}
        </Tabs>
      </div>
      <AddTask open={open} setOpen={setOpen} />
    </div>
  );
};

export default Tasks;
