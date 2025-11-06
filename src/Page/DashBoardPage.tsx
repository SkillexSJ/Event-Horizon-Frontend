import { Link } from "react-router";
import { useState, useMemo } from "react";
import { useGetAllEvents, useDeleteEvent, type Event } from "../api/useEvent";
import { useGetAllBookings, type Booking } from "../api/useBooking";
import { useNavigate } from "react-router";
import { Pencil, Trash2, Eye, FolderOpen, AlertTriangle } from "lucide-react";
import {
  useGetCategoriesWithEvents,
  useDeleteCategory,
} from "../api/useCategories";
import toast from "react-hot-toast";
import { errorToastOptions, toastOptions } from "../utils/constant";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<
    "events" | "bookings" | "categories"
  >("events");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<
    string | null
  >(null);

  //! Fetch events and bookings
  const {
    data: events = [],
    isLoading: eventsLoading,
    error: eventsError,
  } = useGetAllEvents();

  //! Fetch bookings
  const { data: bookings = [], isLoading: bookingsLoading } =
    useGetAllBookings();

  //! Fetch categories with events
  const { data: categoriesWithEvents = [], isLoading: categoriesLoading } =
    useGetCategoriesWithEvents();
  //! Delete event mutation
  const deleteEventMutation = useDeleteEvent();
  //! Delete category mutation
  const deleteCategoryMutation = useDeleteCategory();

  //! Get user ID from localStorage
  const getUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id;
    } catch {
      return null;
    }
  };
  //* Get host ID from localStorage
  const hostId = getUserId();

  //! Filter events that belong to the current host
  const myEvents = useMemo(() => {
    if (!hostId) return [];
    return events.filter((event) => event.host_id === hostId);
  }, [events, hostId]);

  //! Extract unique categories from my events
  const categories = useMemo(() => {
    const cats = new Set(myEvents.map((event) => event.category_name));
    return Array.from(cats);
  }, [myEvents]);

  //! Calculate event status using start_time and end_time
  const getEventStatus = (event: Event): "upcoming" | "ongoing" | "past" => {
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);

    if (now < startTime) return "upcoming";
    if (now >= startTime && now <= endTime) return "ongoing";
    return "past";
  };

  //! Filter events based on search and filters
  const filteredEvents = useMemo(() => {
    return myEvents.filter((event) => {
      const matchesSearch = event.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || event.category_name === categoryFilter;
      const status = getEventStatus(event);
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [myEvents, searchQuery, categoryFilter, statusFilter]);

  //!Calculate statistics
  const stats = useMemo(() => {
    const totalEvents = myEvents.length;
    const upcomingEvents = myEvents.filter(
      (event) => getEventStatus(event) === "upcoming"
    ).length;
    const ongoingEvents = myEvents.filter(
      (event) => getEventStatus(event) === "ongoing"
    ).length;

    // Use ALL bookings for admin panel (not filtered)
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce(
      (sum: number, booking: Booking) => sum + (booking.total_paid || 0),
      0
    );

    // Calculate total tickets sold from all bookings
    const totalTicketsSold = bookings.reduce(
      (sum: number, booking: Booking) => sum + booking.quantity,
      0
    );

    // Calculate tickets availability
    const availableTickets = myEvents.reduce((sum, event) => {
      return (
        sum +
        event.tickets.reduce(
          (tSum, ticket) => tSum + ticket.available_quantity,
          0
        )
      );
    }, 0);

    return {
      totalEvents,
      upcomingEvents,
      ongoingEvents,
      totalBookings,
      totalRevenue,
      totalTicketsSold,
      availableTickets,
    };
  }, [myEvents, bookings]);

  //! Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  //! Handle event deletion
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEventMutation.mutateAsync(eventId);
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(
        "Failed to delete event. Please try again.",
        errorToastOptions
      );
      console.error("Failed to delete event:", error);
    }
  };

  //! Handle event update navigate to form
  const handleUpdateEvent = (event: Event) => {
    navigate(`/admin/add-event?edit=${event.id}`);
  };

  //! Handle category deletion
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
      setDeleteCategoryConfirm(null);
      toast.success("Category deleted successfully!", toastOptions);
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Failed to delete category", errorToastOptions);
    }
  };

  //! Get ALL bookings for admin panel (filtered by host's events)
  const myBookingsData = useMemo(() => {
    //! SET USE KORLAM
    const myEventIds = new Set(myEvents.map((event) => event.id));
    return bookings.filter((booking) => myEventIds.has(booking.event_id));
  }, [bookings, myEvents]);

  //! Loading state
  if (eventsLoading || bookingsLoading || categoriesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
        </div>
      </div>
    );
  }

  //! Error state
  if (eventsError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          <p className="font-semibold">Error loading events</p>
          <p className="text-sm mt-1">{eventsError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Dashboard</h2>
          <p className="text-brand-text-dim mt-1">
            Manage your events and track performance
          </p>
        </div>
        <Link to="/admin/add-event">
          <button className="bg-brand-accent text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-accent-dark transition-colors shadow-custom-glow flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add New Event
          </button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Events */}
        <div className="bg-brand-surface border border-white/10 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-brand-text-dim text-sm font-semibold">
              Total Events
            </h3>
            <div className="bg-blue-500/10 rounded-lg p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-blue-400"
              >
                <path
                  fillRule="evenodd"
                  d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-brand-text">
            {stats.totalEvents}
          </p>
          <p className="text-xs text-brand-text-dim mt-1">
            {stats.upcomingEvents} upcoming
            {stats.ongoingEvents > 0 && ` • ${stats.ongoingEvents} ongoing`}
          </p>
        </div>

        {/* Total Bookings */}
        <div
          onClick={() => setViewMode("bookings")}
          className="bg-brand-surface border border-white/10 rounded-xl p-6 shadow-lg cursor-pointer hover:border-green-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-brand-text-dim text-sm font-semibold">
              Total Bookings
            </h3>
            <div className="bg-green-500/10 rounded-lg p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-green-400"
              >
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-brand-text">
            {stats.totalBookings}
          </p>
          <p className="text-xs text-brand-text-dim mt-1">
            {stats.totalTicketsSold} tickets sold • Click to view
          </p>
        </div>

        {/* Total Revenue */}
        <div className="bg-brand-surface border border-white/10 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-brand-text-dim text-sm font-semibold">
              Total Revenue
            </h3>
            <div className="bg-purple-500/10 rounded-lg p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-purple-400"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.798 7.45c.512-.67 1.135-.95 1.702-.95s1.19.28 1.702.95a.75.75 0 001.192-.91C12.637 5.55 11.596 5 10.5 5s-2.137.55-2.894 1.54A5.205 5.205 0 006.83 8H5.75a.75.75 0 000 1.5h.77a6.333 6.333 0 000 1h-.77a.75.75 0 000 1.5h1.08c.183.528.442 1.023.776 1.46.757.99 1.798 1.54 2.894 1.54s2.137-.55 2.894-1.54a.75.75 0 00-1.192-.91c-.512.67-1.135.95-1.702.95s-1.19-.28-1.702-.95a3.505 3.505 0 01-.343-.55h1.795a.75.75 0 000-1.5H8.026a4.835 4.835 0 010-1h2.224a.75.75 0 000-1.5H8.455c.098-.195.212-.38.343-.55z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-brand-text">
            <span className="text-brand-accent text-4xl">৳</span>{" "}
            {stats.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-brand-text-dim mt-1">From all events</p>
        </div>

        {/* Available Tickets */}
        <div className="bg-brand-surface border border-white/10 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-brand-text-dim text-sm font-semibold">
              Available Tickets
            </h3>
            <div className="bg-orange-500/10 rounded-lg p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-orange-400"
              >
                <path
                  fillRule="evenodd"
                  d="M1 4.75C1 3.784 1.784 3 2.75 3h14.5c.966 0 1.75.784 1.75 1.75v10.515a1.75 1.75 0 01-1.75 1.75h-1.5c-.078 0-.155-.005-.23-.015H4.48c-.075.01-.152.015-.23.015h-1.5A1.75 1.75 0 011 15.265V4.75zm16.5 7.385V11.01a.25.25 0 00-.25-.25h-1.5a.25.25 0 00-.25.25v1.125c0 .138.112.25.25.25h1.5a.25.25 0 00.25-.25zm0 2.005a.25.25 0 00-.25-.25h-1.5a.25.25 0 00-.25.25v1.125c0 .108.069.2.165.235h1.585a.25.25 0 00.25-.25v-1.11zm-15 1.11v-1.11a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25v1.125a.25.25 0 01-.164.235H2.75a.25.25 0 01-.25-.25zm2-4.24v1.125a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25V11.01a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25zm0-2.005a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25V7.885a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25v1.125zM17.5 7.885v1.125a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25V7.885a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25zM4.5 4.5v1.645a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25V4.75a.25.25 0 01.25-.25h1.585c-.096.036-.165.128-.165.236zm13 1.395a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25V4.5c0-.108.069-.2.165-.236h1.585a.25.25 0 01.25.25v1.645z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-brand-text">
            {stats.availableTickets}
          </p>
          <p className="text-xs text-brand-text-dim mt-1">Ready to sell</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-brand-surface border border-white/10 rounded-xl p-4 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-brand-text-dim absolute left-3 top-1/2 -translate-y-1/2"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-bg border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-brand-text placeholder-brand-text-dim focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-brand-bg border border-white/10 text-brand-text rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-brand-bg border border-white/10 text-brand-text rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setViewMode("events")}
          className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
            viewMode === "events"
              ? "bg-brand-accent text-white shadow-custom-glow"
              : "bg-brand-surface text-brand-text-dim hover:text-brand-text border border-white/10"
          }`}
        >
          My Events
        </button>
        <button
          onClick={() => setViewMode("bookings")}
          className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
            viewMode === "bookings"
              ? "bg-brand-accent text-white shadow-custom-glow"
              : "bg-brand-surface text-brand-text-dim hover:text-brand-text border border-white/10"
          }`}
        >
          Event Bookings
        </button>
        <button
          onClick={() => setViewMode("categories")}
          className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
            viewMode === "categories"
              ? "bg-brand-accent text-white shadow-custom-glow"
              : "bg-brand-surface text-brand-text-dim hover:text-brand-text border border-white/10"
          }`}
        >
          <FolderOpen className="w-4 h-4 inline-block mr-2" />
          Categories
        </button>
      </div>

      {/* Events List */}
      {viewMode === "events" ? (
        <div className="bg-brand-surface border border-white/10 rounded-xl shadow-lg overflow-hidden">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 mx-auto text-brand-text-dim mb-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
              <h3 className="text-xl font-semibold text-brand-text mb-2">
                No events found
              </h3>
              <p className="text-brand-text-dim mb-6">
                {myEvents.length === 0
                  ? "Start creating events to manage them here"
                  : "Try adjusting your filters"}
              </p>
              {myEvents.length === 0 && (
                <Link to="/admin/add-event">
                  <button className="bg-brand-accent text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-brand-accent-dark transition-colors">
                    Create Your First Event
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-brand-text-dim uppercase tracking-wider">
                      Event Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-brand-text-dim uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-brand-text-dim uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-brand-text-dim uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-brand-text-dim uppercase tracking-wider">
                      Tickets
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-brand-text-dim uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-brand-text-dim uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredEvents.map((event) => {
                    const status = getEventStatus(event);
                    const totalTickets = event.tickets.reduce(
                      (sum, t) => sum + t.total_quantity,
                      0
                    );
                    const availableTickets = event.tickets.reduce(
                      (sum, t) => sum + t.available_quantity,
                      0
                    );
                    const soldTickets = totalTickets - availableTickets;

                    return (
                      <tr
                        key={event.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-semibold text-brand-text">
                                {event.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-brand-text-dim">
                            {formatDate(event.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-brand-accent/10 text-brand-accent">
                            {event.category_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-dim">
                          {event.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-dim">
                          <div className="flex flex-col">
                            <span className="text-brand-text font-semibold">
                              {soldTickets}/{totalTickets}
                            </span>
                            <span className="text-xs">sold</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              status === "upcoming"
                                ? "bg-green-500/10 text-green-400"
                                : status === "ongoing"
                                ? "bg-yellow-500/10 text-yellow-400"
                                : "bg-gray-500/10 text-gray-400"
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/event/${event.id}`}
                              className="text-blue-400 hover:text-blue-300 transition-colors p-2"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleUpdateEvent(event)}
                              className="text-yellow-400 hover:text-yellow-300 transition-colors p-2"
                              title="Edit Event"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {deleteConfirm === event.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors px-2 py-1 text-xs font-semibold bg-red-500/10 rounded"
                                  title="Confirm Delete"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="text-gray-400 hover:text-gray-300 transition-colors px-2 py-1 text-xs font-semibold bg-gray-500/10 rounded"
                                  title="Cancel"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(event.id)}
                                className="text-red-400 hover:text-red-300 transition-colors p-2"
                                title="Delete Event"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : viewMode === "bookings" ? (
        // Bookings View
        <div className="bg-brand-surface border border-white/10 rounded-xl shadow-lg overflow-hidden">
          {myBookingsData.length === 0 ? (
            <div className="text-center py-16">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 mx-auto text-brand-text-dim mb-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-brand-text mb-2">
                No bookings yet
              </h3>
              <p className="text-brand-text-dim mb-6">
                Bookings for your events will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-brand-text-dim uppercase tracking-wider">
                      Event Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-brand-text-dim uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-brand-text-dim uppercase tracking-wider">
                      Ticket Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-brand-text-dim uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-brand-text-dim uppercase tracking-wider">
                      Total Paid
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-brand-text-dim uppercase tracking-wider">
                      Booked At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-brand-text-dim uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {myBookingsData.map((booking) => {
                    const event = events.find((e) => e.id === booking.event_id);
                    return (
                      <tr
                        key={booking.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-brand-text">
                            {event?.name || "Unknown Event"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-brand-text-dim truncate max-w-[150px]">
                            {booking.user_id || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-500/10 text-purple-400">
                            {booking.ticket_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                          {booking.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text font-semibold">
                          <span className="text-lg">৳</span>
                          {booking.total_paid?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-dim">
                          {booking.booked_at
                            ? formatDate(booking.booked_at)
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.status === "confirmed"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-yellow-500/10 text-yellow-400"
                            }`}
                          >
                            {booking.status || "Confirmed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : viewMode === "categories" ? (
        // Categories Management View
        <div className="bg-brand-surface border border-white/10 rounded-xl shadow-lg overflow-hidden">
          {categoriesWithEvents.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-16 h-16 mx-auto text-brand-text-dim mb-4" />
              <h3 className="text-xl font-semibold text-brand-text mb-2">
                No categories found
              </h3>
              <p className="text-brand-text-dim mb-6">
                Create your first category to organize events
              </p>
              <Link
                to="/admin/add-event"
                className="inline-flex items-center gap-2 bg-brand-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-accent-dark transition-all"
              >
                Create Category
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-brand-text uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-brand-text uppercase tracking-wider">
                      Events Count
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-brand-text uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-brand-text uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {categoriesWithEvents.map((categoryData) => (
                    <tr
                      key={categoryData.category.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-5 h-5 text-brand-accent" />
                          <span className="text-sm font-semibold text-brand-text">
                            {categoryData.category.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-brand-accent/10 text-brand-accent">
                            {categoryData.event_count}{" "}
                            {categoryData.event_count === 1
                              ? "Event"
                              : "Events"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-dim">
                        {formatDate(categoryData.category.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {deleteCategoryConfirm === categoryData.category.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                handleDeleteCategory(categoryData.category.id)
                              }
                              disabled={deleteCategoryMutation.isPending}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteCategoryConfirm(null)}
                              disabled={deleteCategoryMutation.isPending}
                              className="flex items-center gap-1 px-3 py-1.5 bg-brand-surface text-brand-text border border-white/10 rounded-lg hover:bg-white/5 transition-all disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              categoryData.event_count > 0
                                ? setDeleteCategoryConfirm(
                                    categoryData.category.id
                                  )
                                : handleDeleteCategory(categoryData.category.id)
                            }
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                              categoryData.event_count > 0
                                ? "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/30"
                                : "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                            }`}
                            title={
                              categoryData.event_count > 0
                                ? "This category has events. Deleting will remove all associated events."
                                : "Delete category"
                            }
                          >
                            {categoryData.event_count > 0 ? (
                              <>
                                <AlertTriangle className="w-4 h-4" />
                                Delete with {categoryData.event_count} events
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default DashboardPage;
