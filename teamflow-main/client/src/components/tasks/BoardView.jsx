import TaskCard from "./TaskCard";

const BoardView = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className='w-full py-12 flex flex-col items-center justify-center bg-white dark:bg-[#1f1f1f] rounded-md shadow-sm border border-gray-100 dark:border-gray-700'>
        <p className='text-gray-500 dark:text-gray-400 font-medium'>No issues found.</p>
      </div>
    );
  }

  return (
    <div className='w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 2xl:gap-8'>
      {tasks.map((task, index) => (
        <TaskCard task={task} key={task?._id || index} />
      ))}
    </div>
  );
};

export default BoardView;
