import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { BsChevronExpand } from "react-icons/bs";
import { MdCheck } from "react-icons/md";
import { useGetTeamListsQuery } from "../../redux/slices/api/userApiSlice.js";
import { getInitials } from "../../utils/index.js";

export default function UserList({ team, setTeam }) {
  const { data, isLoading } = useGetTeamListsQuery({ search: "" });
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (!data || isLoading) return;

    if (team && team.length > 0) {
      const teamIdStrings = team.map((item) =>
        item?._id ? item._id.toString() : item?.toString()
      );
      const matched = data.filter((u) => teamIdStrings.includes(u._id.toString()));
      setSelectedUsers(matched);
      setTeam(matched.map((u) => u._id));
    } else {
      setSelectedUsers([]);
    }
  }, [data, isLoading]);

  const handleChange = (selected) => {
    setSelectedUsers(selected);
    setTeam(selected.map((u) => u._id));
  };

  return (
    <div className='w-full'>
      <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1'>
        Assign Issue To (Multiple Assignees):
      </label>
      <Listbox
        value={selectedUsers}
        onChange={handleChange}
        multiple
        by='_id'
      >
        <div className='relative mt-1'>
          <Listbox.Button className='relative w-full cursor-pointer rounded bg-white dark:bg-[#1f1f1f] pl-3 pr-10 text-left py-2.5 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'>
            <span className='block truncate text-gray-800 dark:text-white'>
              {selectedUsers && selectedUsers.length > 0
                ? selectedUsers.map((user) => user.name).join(", ")
                : "Select team member(s)..."}
            </span>

            <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
              <BsChevronExpand
                className='h-5 w-5 text-gray-400'
                aria-hidden='true'
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Listbox.Options className='z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm'>
              {data && data.length > 0 ? (
                data.map((user) => (
                  <Listbox.Option
                    key={user._id}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active
                          ? "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-white"
                          : "text-gray-900 dark:text-gray-200"
                      }`
                    }
                    value={user}
                  >
                    {({ selected }) => (
                      <>
                        <div
                          className={`flex items-center gap-2 truncate ${
                            selected ? "font-semibold" : "font-normal"
                          }`}
                        >
                          <div className='w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold bg-blue-600'>
                            <span>{getInitials(user.name)}</span>
                          </div>
                          <span>{user.name}</span>
                          <span className='text-xs text-gray-400 ml-1'>
                            ({user.title || user.role})
                          </span>
                        </div>
                        {selected ? (
                          <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400'>
                            <MdCheck className='h-5 w-5' aria-hidden='true' />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))
              ) : (
                <div className='p-3 text-sm text-gray-500'>
                  No registered users found.
                </div>
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      <span className='text-xs text-gray-400 mt-1 block'>
        Click to toggle assignments. Multiple users can be assigned.
      </span>
    </div>
  );
}
