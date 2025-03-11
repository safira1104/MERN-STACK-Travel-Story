import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import {MdAdd} from "react-icons/md";
import Modal from "react-modal";
import TravelStoryCard from '../../components/Cards/travel-story-card';

import { ToastContainer, toast } from "react-toastify";
import"react-toastify/dist/ReactToastify.css";
import AddEditTravelStory from './add-edit-travel-story';
import { FaSlash } from 'react-icons/fa6';
import ViewTravelStory from './view-travel-story';
import EmptyCard from '../../components/Cards/empty-card';

import EmptyImg from '../../assets/images/2.png'
import { DayPicker } from 'react-day-picker';

const Home = () => {

  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  const [dateRange, setDateRange] = useState(null);

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  });
  
  //Get User Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        // Set user info if data exists
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        // Clear storage if unauthorized
        localStorage.clear();
        navigate("/login"); // Redirect to login
      }
    }
  };

  // Get all travel stories
  const getAllTravelStories = async () => {
    try {
      const response = await axiosInstance.get("/get-all-stories");
      if (response.data && response.data.stories) {
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.log("An unexpected error occured. Please try again.")      
    }
  }

  // Handle Edit Story Click
  const handleEdit = (data) => {
    setOpenAddEditModal({ isShown:true, type:"edit", data: data });
  }

  // Handle Travel Story Click
  const handleViewStory = (data) => {
    setOpenViewModal({ isShown: true, data });
  };

  // Handle Update Favourite
  const updateIsFavourite = async (storyData) => {
    const storyId = storyData._id;

    try {
      const response = await axiosInstance.put(
        "/update-is-favourite/" + storyId,
        {
          isFavourite: !storyData.isFavourite,
        }
      );

      if(response.data && response.data.story){
        toast.success("Story Updated Successfully");
        getAllTravelStories();
      }
    }catch (error) {
      console.log("An unexpected error occured. Please try again.");      
    }
  }

  // Delete Story
  const deleteTravelStory = async (data) => {
    const storyId = data._id;
    try {
      const response = await axiosInstance.delete("/delete-story/" + storyId);

      if (response.data && !response.data.error) {
        toast.error("Story Deleted Successfully");
        setOpenViewModal((prevState) => ({...prevState, isShown: false}));
        getAllTravelStories();
      }
    } catch (error) {
      
      // Handle unexpected errors
      console.log("An unexspected error occured. Please try again");
      
     }
  };

  // Search Story
  const onSearchStory = async (query) => {
    try {
      const response = await axiosInstance.get("/search", {
        params: {
          query,
        },
      });

      if (response.data && response.data.stories) {
        setFilterType("Search");
        setAllStories(response.data.stories);
      }} catch (error) {
      
        // Handle unexpected errors
        console.log("An unexspected error occured. Please try again");
      }
  }

  const handleClearSearch = () => {
    setFilterType("");
    getAllTravelStories();
  };

  useEffect(() => {
    getAllTravelStories();
    getUserInfo();
    return () => {};
  },[]);

  // Handle Date Range Select
  const handleDayClick = () => {
    setDateRange(day);
    filterStoriesByDate(day);
  }

  return (
    <>
     <Navbar 
        userInfo={userInfo} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        onSearchNote={onSearchStory}
        handleClearSearch={handleClearSearch}
      />

     <div className='container mx-auto py-10'>
      <div className='flex gap-7'>
        <div className='flex-1'>
          {
            allStories.length > 0 ? (
              <div className='grid grid-cols-2 gap-4'>
                {allStories.map((item) => {
                  return (
                    <TravelStoryCard 
                      key={item._id}
                      imgUrl={item.imageUrl}
                      title={item.title}
                      story={item.story}
                      date={item.visitedDate}
                      visitedLocation={item.visitedLocation}
                      isFavourite={item.isFavourite}
                      onClick={() => handleViewStory(item)}
                      onFavouriteClick={() => updateIsFavourite(item)}

                    />
                  );
                })}
              </div>
            ) : (
              <EmptyCard 
              imgSrc={EmptyImg} 
              message={`Start creating your first Travel Story! Click the 'Add' button to jot down your thoughts, ideas, and memories. Lets get started!`}
              />
            )}
        </div>

        <div className='w-[320px]'>
          <div className='bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg'>
            <div className='p-3'>
              <DayPicker 
                captionLayout='range'
                mode="range"
                selected={dateRange}
                pagedNavigation
              />
            </div>
          </div>
        </div>
      </div>
     </div>

     {/*Add & Edit Travel Story Model  */}
     <Modal
      isOpen={openAddEditModal.isShown}
      onRequestClose={()=> {}}
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.2)",
          zIndex:999,
        },
      }}
      appElement={document.getElementById("root")}
      className="model-box"
     >
      <AddEditTravelStory 
        type={openAddEditModal.type}
        storyInfo={openAddEditModal.data}
        onClose={() => {
          setOpenAddEditModal({ isShown: false, type: "add", data: null });
        }}
        getAllTravelStories={getAllTravelStories}
      />
     </Modal>

     {/* View Travel Story Model  */}
     <Modal
      isOpen={openViewModal.isShown}
      onRequestClose={()=> {}}
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.2)",
          zIndex:999,
        },
      }}
      appElement={document.getElementById("root")}
      className="model-box"
     >
      <ViewTravelStory
        storyInfo = {openViewModal.data || null} 
        onClose={() => {
          setOpenViewModal((prevState) => ({ ...prevState, isShown: false}));
        }}
        onEditClick={() => {
          setOpenViewModal((prevState) => ({ ...prevState, isShown: false}));
          handleEdit(openViewModal.data || null)
        }}
        onDeleteClick={() => {
          deleteTravelStory(openViewModal.data || null);
        }}
      />
     </Modal>

     <button
      className='w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10'
      onClick={() => {
        setOpenAddEditModal({ isShown:true, type:"add", data: null });
      }}
     >
      <MdAdd className="text-[32px] text-white" />
     </button>

     <ToastContainer />
     
    </>
  );
};

export default Home