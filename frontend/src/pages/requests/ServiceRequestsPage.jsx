import { useCallback, useEffect, useState } from "react";

import ServiceRequestList from "./ServiceRequestList";
import CreateServiceRequestModal from "./CreateServiceRequestModal";
import ViewServiceRequestModal from "./ViewServiceRequestModal";
import EditServiceRequestModal from "./EditServiceRequestModal";

import api from "../../services/api";

const ServiceRequestsPage = () => {
  const [customers, setCustomers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [agents, setAgents] = useState([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  /*
   * Used to refresh the service request grid
   * after create/edit.
   */
  const [refreshKey, setRefreshKey] = useState(0);

  /*
   * Load customers, teams and agents.
   *
   * These values are used by both the
   * Create and Edit request modals.
   */
  const loadAssignmentData = useCallback(async () => {
    try {
      setLoadingOptions(true);
      setOptionsError("");

      const [customersResponse, teamsResponse, agentsResponse] =
        await Promise.all([
          api.get("/customers", {
            params: {
              page: 1,
              limit: 100,
              sortBy: "name",
              sortOrder: "asc",
            },
          }),

          api.get("/teams", {
            params: {
              page: 1,
              limit: 100,
            },
          }),

          api.get("/users", {
            params: {
              page: 1,
              limit: 100,
              role: "agent",
            },
          }),
        ]);

      /*
       * Customers
       */
      const customersData =
        customersResponse.data?.data ||
        customersResponse.data;

      setCustomers(
        customersData?.customers ||
          customersData?.users ||
          customersData?.data ||
          []
      );

      /*
       * Teams
       */
      const teamsData =
        teamsResponse.data?.data ||
        teamsResponse.data;

      setTeams(
        teamsData?.teams ||
          teamsData?.data ||
          []
      );

      /*
       * Agents
       */
      const agentsData =
        agentsResponse.data?.data ||
        agentsResponse.data;

      let agentList =
        agentsData?.users ||
        agentsData?.agents ||
        agentsData?.data ||
        [];

      /*
       * Safety filter.
       *
       * Even if the backend returns all users,
       * only users with agent role should appear
       * in the Support Agent dropdown.
       */
      if (Array.isArray(agentList)) {
        agentList = agentList.filter(
          (user) => user.role === "agent"
        );
      }

      setAgents(agentList);
    } catch (error) {
      console.error(
        "Failed to load service request options:",
        error
      );

      setOptionsError(
        error.response?.data?.message ||
          "Failed to load customers, teams and agents."
      );
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  /*
   * Initial load.
   */
  useEffect(() => {
    loadAssignmentData();
  }, [loadAssignmentData]);

  /*
   * Create success
   *
   * 1. Close modal
   * 2. Reload dropdown data
   * 3. Reload request grid
   */
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

  /*
   * Edit success
   *
   * 1. Close modal
   * 2. Clear selected request
   * 3. Reload dropdown data
   * 4. Reload request grid
   */
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
        onCreate={() => setShowCreate(true)}
        onView={handleView}
        onEdit={handleEdit}
      />

      {showCreate && (
        <CreateServiceRequestModal
          customers={customers}
          teams={teams}
          agents={agents}
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