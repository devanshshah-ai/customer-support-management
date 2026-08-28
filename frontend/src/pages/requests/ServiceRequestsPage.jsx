import { useCallback, useEffect, useState } from "react";

import ServiceRequestList from "./ServiceRequestList";
import CreateServiceRequestModal from "./CreateServiceRequestModal";
import ViewServiceRequestModal from "./ViewServiceRequestModal";
import EditServiceRequestModal from "./EditServiceRequestModal";

import api from "../../services/api";
import { useAppSelector } from "../../app/hooks";

const ServiceRequestsPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const currentUserRole = user?.role;

  const [customers, setCustomers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAssignmentData = useCallback(async () => {
    try {
      setLoadingOptions(true);
      setOptionsError("");

      const customersResponse = await api.get("/customers", {
        params: {
          page: 1,
          limit: 100,
          sortBy: "name",
          sortOrder: "asc",
        },
      });

      const customersData =
        customersResponse.data?.data || customersResponse.data;
      setCustomers(customersData?.customers || []);

      // Assignment directories are needed only by management roles.
      if (currentUserRole === "admin" || currentUserRole === "manager") {
        const [teamsResponse, agentsResponse] = await Promise.all([
          api.get("/teams", {
            params: { page: 1, limit: 100 },
          }),
          api.get("/users", {
            params: {
              page: 1,
              limit: 100,
              role: "agent",
              isActive: true,
            },
          }),
        ]);

        const teamsData = teamsResponse.data?.data || teamsResponse.data;
        setTeams(teamsData?.teams || []);

        const agentsData = agentsResponse.data?.data || agentsResponse.data;
        const agentList = Array.isArray(agentsData?.users)
          ? agentsData.users.filter((item) => item.role === "agent")
          : [];
        setAgents(agentList);
      } else {
        setTeams([]);
        setAgents([]);
      }
    } catch (error) {
      console.error("Failed to load service request options:", error);
      setOptionsError(
        error.response?.data?.message ||
          "Failed to load service request options."
      );
    } finally {
      setLoadingOptions(false);
    }
  }, [currentUserRole]);

  useEffect(() => {
    loadAssignmentData();
  }, [loadAssignmentData]);

  const handleCreateSuccess = async () => {
    setShowCreate(false);
    await loadAssignmentData();
    setRefreshKey((current) => current + 1);
  };

  const handleView = (request) => {
    setSelectedRequest(request);
    setShowView(true);
  };

  const handleEdit = (request) => {
    setSelectedRequest(request);
    setShowEdit(true);
  };

  const handleEditSuccess = async () => {
    setShowEdit(false);
    setSelectedRequest(null);
    await loadAssignmentData();
    setRefreshKey((current) => current + 1);
  };

  return (
    <>
      {optionsError && (
        <div className="service-request-options-error">
          {optionsError}
        </div>
      )}

      <ServiceRequestList
        refreshKey={refreshKey}
        currentUserRole={currentUserRole}
        onCreate={() => setShowCreate(true)}
        onView={handleView}
        onEdit={handleEdit}
      />

      {showCreate && (
        <CreateServiceRequestModal
          customers={customers}
          teams={teams}
          agents={agents}
          currentUserRole={currentUserRole}
          loadingOptions={loadingOptions}
          onClose={() => setShowCreate(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showView && selectedRequest && (
        <ViewServiceRequestModal
          request={selectedRequest}
          onClose={() => {
            setShowView(false);
            setSelectedRequest(null);
          }}
        />
      )}

      {showEdit && selectedRequest && (
        <EditServiceRequestModal
          request={selectedRequest}
          customers={customers}
          teams={teams}
          agents={agents}
          currentUserRole={currentUserRole}
          loadingOptions={loadingOptions}
          onClose={() => {
            setShowEdit(false);
            setSelectedRequest(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default ServiceRequestsPage;
