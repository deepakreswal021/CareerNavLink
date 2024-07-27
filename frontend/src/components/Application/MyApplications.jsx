import React, { useContext, useEffect, useState } from "react";
import ResumeModal from "./ResumeModal";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";

const MyApplications = () => {
  const { user } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeImageUrl, setResumeImageUrl] = useState("");

  const { isAuthorized , baseurl } = useContext(Context);
  const navigateTo = useNavigate();
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    try {
      if (user && user.role === "Employer") {
        axios
          .get(`${baseurl}/api/v1/application/employer/getall`, {
            withCredentials: true,
          })
          .then((res) => {
            setApplications(res.data.applications);
          });
      } else {
        axios
          .get(`${baseurl}/api/v1/application/jobseeker/getall`, {
            withCredentials: true,
          })
          .then((res) => {
            setApplications(res.data.applications);
          });
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, [isAuthorized, refresh]);

  if (!isAuthorized) {
    navigateTo("/");
  }

  const deleteApplication = (id) => {
    try {
      axios
        .delete(`${baseurl}/api/v1/application/delete/${id}`, {
          withCredentials: true,
        })
        .then((res) => {
          toast.success(res.data.message);
          setApplications((prevApplication) =>
            prevApplication.filter((application) => application._id !== id)
          );
        });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const openModal = (imageUrl) => {
    setResumeImageUrl(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const selectHandler = async(id) => {
    // console.log("Select clicked", id);
    await axios.get(`${baseurl}/api/v1/application/employer/statusAccept/${id}`, {
      withCredentials: true,
    })
    .then((res) => {
      toast.success(res.data.message);
      // navigateTo("/applications/me");
      setRefresh((prev) => !prev);
      
    })
    .catch((error) => {
      toast.error(error.response.data.message);
    });
  };

  const rejectHandler = async(id) => {
    // console.log("Select clicked", id);
    await axios.get(`${baseurl}/api/v1/application/employer/statusReject/${id}`, {
      withCredentials: true,
    })
    .then((res) => {
      toast.success(res.data.message);
      // navigateTo("/applications/me");
      setRefresh((prev) => !prev);
      
    })
    .catch((error) => {
      toast.error(error.response.data.message);
    });
  };
  return (
    <section className="my_applications page">
      {user && user.role === "Job Seeker" ? (
        <div className="container">
          <h1>My Applications</h1>
          {applications.length <= 0 ? (
            <>
              {" "}
              <h4>No Applications Found</h4>{" "}
            </>
          ) : (
            applications.map((element) => {
              return (
                <JobSeekerCard
                  element={element}
                  key={element._id}
                  deleteApplication={deleteApplication}
                  openModal={openModal}
                />
              );
            })
          )}
        </div>
      ) : (
        <div className="container">
          <h1>Applications From Job Seekers</h1>
          {applications.length <= 0 ? (
            <>
              <h4>No Applications Found</h4>
            </>
          ) : (
            applications.map((element) => {
              return (
                <EmployerCard
                  element={element}
                  key={element._id}
                  openModal={openModal}
                  selectHandler={selectHandler}
                  rejectHandler={rejectHandler}
                />
              );
            })
          )}
        </div>
      )}
      {modalOpen && (
        <ResumeModal imageUrl={resumeImageUrl} onClose={closeModal} />
      )}
    </section>
  );
};

export default MyApplications;

const JobSeekerCard = ({ element, deleteApplication, openModal }) => {
  return (
    <>
      <div className="job_seeker_card">
        <div className="detail">
          <p>
            <span>Name:</span> {element.name}
          </p>
          <p>
            <span>Email:</span> {element.email}
          </p>
          <p>
            <span>Phone:</span> {element.phone}
          </p>
          <p>
            <span>Address:</span> {element.address}
          </p>
          <p>
            <span>CoverLetter:</span> {element.coverLetter}
          </p>
        </div>
        <div className="resume">
          <img
            src={element.resume.url}
            alt="resume"
            onClick={() => openModal(element.resume.url)}
          />
        </div>
        <div className="btn_area">
          <button onClick={() => deleteApplication(element._id)}>
            Delete Application
          </button>
        </div>
      </div>
    </>
  );
};

const EmployerCard = ({ element, openModal, selectHandler, rejectHandler }) => {
  return (
    <>
      <div className="job_seeker_card">
        <div className="detail">
          <p>
            <span>Name:</span> {element.name}
          </p>
          <p>
            <span>Email:</span> {element.email}
          </p>
          <p>
            <span>Phone:</span> {element.phone}
          </p>
          <p>
            <span>Address:</span> {element.address}
          </p>
          <p>
            <span>CoverLetter:</span> {element.coverLetter}
          </p>
        </div>
        <div className="resume">
          <img
            src={element.resume.url}
            alt="resume"
            onClick={() => openModal(element.resume.url)}
          />
        </div>
        <div className="btn-style">
          {element.applicationStatus === "null" && (
            <>
              <button className="accept"  onClick={() => selectHandler(element._id)}>Select</button>
              <button className="reject"  onClick={() => rejectHandler(element._id)} >Reject</button>
            </>
          )}
          {element.applicationStatus === "accepted" && (
            <p className="status accepted">Already Selected</p>
          )}
          {element.applicationStatus === "rejected" && (
            <p className="status rejected">Already Rejected</p>
          )}
        </div>
      </div>
    </>
  );
};
