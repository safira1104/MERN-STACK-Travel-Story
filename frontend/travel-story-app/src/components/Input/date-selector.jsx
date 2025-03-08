import React, { useState } from 'react'
import { DayPicker } from "react-day-picker";
import moment from 'moment';
import { MdClose, MdOutlineDateRange } from 'react-icons/md';

const DateSelector = ({ date, setDate }) => {

    const [openDatePicker, setsetOpenDatePicker] = useState(false)
  return (
    <div>
        <button className='inline-flex items-center gap-2 text-[13px] font-medium text-sky-600 bg-sky-200/40 hover:bg-sky-200/70 rounded px-2 py-1 cursor-pointer' onClick={() => {
            setOpenDatePicker(true);
        }}>
            <MdOutlineDateRange className='text-lg' />
            { date
                ? moment(date).format("Do MMM YYYY")
                : moment().format("Do MMM YYYY")
            }
        </button>

        <div className=''> 
            <button
             className=''
             onClick={() => {
                setOpenDatePicker(false);
             }}
            >
                <MdClose className='text-xl text-sky-600' />
            </button>

            <DayPicker 
                captionLayout='dropdown-buttons'
                mode="single"
                selected={date}
                onSelect={setDate}
                pageNavigation
            />

        </div>
    </div>
  )
}

export default DateSelector