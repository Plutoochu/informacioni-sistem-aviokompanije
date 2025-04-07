import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useNavigate } from "react-router";
import { setPrijavljen } from "../redux/etfdzemat";
import { signout } from "../helper-functions/fetch-functions";
import Logout from "../reusable/Logout";
import Modal from "../reusable/Modal";
import Dugme from "../reusable/Dugme";
import Navigacija from "./Navigacija";

const ProtectedRoute = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { prijavljen } = useAppSelector((s) => s.etfszm);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await signout();
    handleModalClose();
    dispatch(setPrijavljen(false));
    navigate("/prijava");
  };

  const handleModalOpen = () => {
    setModalOpen(true);
    document.body.classList.add("overflow-hidden");
  };

  const handleModalClose = () => {
    setModalOpen(false);
    document.body.classList.remove("overflow-hidden");
  };

  return prijavljen ? (
    <>
      <Outlet />
      <Logout onClick={handleModalOpen} />
      <Modal closeModal={handleModalClose} headerTitle="Odjaviti se?" openModal={modalOpen} hideCloseButton>
        <div className="flex justify-center gap-8 mt-6">
          <Dugme text="Ne" className="rounded" onClick={handleModalClose} />
          <Dugme text="Da" className="bg-red-500 active:bg-red-600 text-white rounded" onClick={handleLogout} />
        </div>
      </Modal>
      <Navigacija />
    </>
  ) : (
    <Navigate to="/prijava" replace />
  );
};

export default ProtectedRoute;
