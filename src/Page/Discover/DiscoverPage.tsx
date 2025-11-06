import { useState, useMemo, useEffect } from "react";
import {
  useGetCategories,
  useGetCategoriesWithEvents,
} from "../../api/useCategories.ts";

import { Search } from "lucide-react";
import EventCardDiscover from "./EventCardDiscover.tsx";

type SortOption =
  | "date-asc"
  | "date-desc"
  | "name-asc"
  | "name-desc"
  | "relevance"
  | "live-now";
type DateFilter =
  | "all"
  | "today"
  | "this-week"
  | "this-month"
  | "next-month"
  | "custom";

const DiscoverPage = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  //! Get all categories
  const { data: categories, isLoading: categoriesLoading } = useGetCategories();
  //! Get categories with their events
  const {
    data: categoriesWithEvents,
    isLoading: eventsLoading,
    isError,
  } = useGetCategoriesWithEvents();

  //! STORE all events in a flat array
  const allEvents = useMemo(() => {
    if (!categoriesWithEvents) return [];
    return categoriesWithEvents.flatMap((cat) => cat.events);
  }, [categoriesWithEvents]);

  //! Filter events
  const filteredEvents = useMemo(() => {
    let filtered = [...allEvents];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((event) =>
        selectedCategories.includes(event.category_name)
      );
    }

    //! Date filtering
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date);

        switch (dateFilter) {
          case "today":
            return eventDate.toDateString() === today.toDateString();

          case "this-week": {
            const weekEnd = new Date(today);
            weekEnd.setDate(today.getDate() + 7);
            return eventDate >= today && eventDate <= weekEnd;
          }

          case "this-month": {
            const monthEnd = new Date(
              today.getFullYear(),
              today.getMonth() + 1,
              0
            );
            return eventDate >= today && eventDate <= monthEnd;
          }

          case "next-month": {
            const nextMonthStart = new Date(
              today.getFullYear(),
              today.getMonth() + 1,
              1
            );
            const nextMonthEnd = new Date(
              today.getFullYear(),
              today.getMonth() + 2,
              0
            );
            return eventDate >= nextMonthStart && eventDate <= nextMonthEnd;
          }

          case "custom": {
            if (customDateStart && customDateEnd) {
              const start = new Date(customDateStart);
              const end = new Date(customDateEnd);
              return eventDate >= start && eventDate <= end;
            }
            return true;
          }

          default:
            return true;
        }
      });
    }

    return filtered;
  }, [
    allEvents,
    searchQuery,
    selectedCategories,
    dateFilter,
    customDateStart,
    customDateEnd,
  ]);

  //! Sort events
  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents];

    switch (sortBy) {
      case "live-now": {
        //! Sort by live events
        return sorted.sort((a, b) => {
          const now = new Date();
          const aStart = new Date(a.start_time);
          const aEnd = new Date(a.end_time);
          const bStart = new Date(b.start_time);
          const bEnd = new Date(b.end_time);

          const aIsLive = now >= aStart && now <= aEnd;
          const bIsLive = now >= bStart && now <= bEnd;

          //? Live events come first
          if (aIsLive && !bIsLive) return -1;
          if (!aIsLive && bIsLive) return 1;

          //! sort by date
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
      }
      case "date-asc":
        return sorted.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      case "date-desc":
        return sorted.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case "relevance":
      default:
        return sorted;
    }
  }, [filteredEvents, sortBy]);

  //? Handle category toggle
  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  //! Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setDateFilter("all");
    setCustomDateStart("");
    setCustomDateEnd("");
    setSortBy("relevance");
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="mb-8 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          {/* //! PAGE TITLE */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gradient mb-2">
              Discover Events
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-brand-text-dim max-w-2xl mx-auto px-4">
              Browse, filter, and find your next unforgettable experience from
              thousands of events.
            </p>
          </div>
        </div>
      </div>

      {/* //! FILTERS */}
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="flex justify-between items-center mb-4 lg:hidden">
            <h2 className="text-xl font-semibold text-brand-text">Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-brand-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-accent-dark transition"
            >
              {showFilters ? "Close" : "Show"}
            </button>
          </div>

          <aside
            className={
              "lg:w-1/4 bg-brand-surface rounded-2xl p-4 sm:p-6 border border-white/10 shadow-xl lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] flex flex-col z-20 transition-all duration-300 " +
              (showFilters ? "block" : "hidden lg:flex")
            }
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-text">
                Filters
              </h2>
              <button
                onClick={clearFilters}
                className="text-brand-accent hover:text-brand-accent-dark text-sm font-semibold transition"
              >
                Clear All
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2 space-y-6">
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-lg font-semibold text-brand-text mb-4">
                  Search
                </h3>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 sm:py-3 text-sm sm:text-base text-brand-text placeholder-brand-text-dim focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all"
                />
              </div>

              <div className="border-b border-white/10 pb-6">
                <h3 className="text-lg font-semibold text-brand-text mb-4">
                  Categories
                  {selectedCategories.length > 0 && (
                    <span className="ml-2 text-sm text-brand-accent">
                      ({selectedCategories.length})
                    </span>
                  )}
                </h3>
                <div className="space-y-3">
                  {categoriesLoading ? (
                    <p className="text-brand-text-dim text-sm">
                      Loading categories...
                    </p>
                  ) : (
                    categories?.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center text-gray-300 hover:text-brand-text transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.name)}
                          onChange={() => handleCategoryToggle(category.name)}
                          className="w-5 h-5 bg-brand-bg border-brand-accent rounded text-brand-accent focus:ring-brand-accent focus:ring-offset-brand-surface"
                        />
                        <span className="ml-3">{category.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* //! DATE */}
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-lg font-semibold text-brand-text mb-4">
                  Date
                </h3>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className="w-full bg-brand-bg border border-white/10 rounded-lg px-4 py-2 sm:py-3 text-sm sm:text-base text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all"
                >
                  <option value="all">Any Date</option>
                  <option value="today">Today</option>
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                  <option value="next-month">Next Month</option>
                  <option value="custom">Custom Range</option>
                </select>

                {dateFilter === "custom" && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm text-brand-text-dim mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customDateStart}
                        onChange={(e) => setCustomDateStart(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-brand-text-dim mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customDateEnd}
                        onChange={(e) => setCustomDateEnd(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <section className="lg:w-3/4 relative z-10">
            <div className=" backdrop-blur-sm border-b border-white/10 pb-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-brand-text">
                  {eventsLoading ? (
                    "Loading events..."
                  ) : (
                    <>
                      Showing {sortedEvents.length} Event
                      {sortedEvents.length !== 1 ? "s" : ""}
                    </>
                  )}
                </h2>
                {/* //! SORT */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-brand-surface border border-white/10 rounded-lg px-4 py-2 text-sm sm:text-base text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all"
                >
                  <option value="relevance">Sort by: Relevance</option>
                  <option value="live-now">Sort by: Live Now</option>
                  <option value="date-desc">
                    Sort by: Date (Newest First)
                  </option>
                  <option value="date-asc">Sort by: Date (Oldest First)</option>
                  <option value="name-asc">Sort by: Name (A-Z)</option>
                  <option value="name-desc">Sort by: Name (Z-A)</option>
                </select>
              </div>
            </div>

            {eventsLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mb-4"></div>
                <p className="text-brand-text-dim">Loading events...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-16">
                <p className="text-red-500 mb-4">
                  Failed to load events. Please try again later.
                </p>
              </div>
            ) : sortedEvents.length === 0 ? (
              <div className="text-center py-16">
                <Search />
                <p className="text-xl text-brand-text-dim mb-2">
                  No events found
                </p>
                <p className="text-brand-text-dim text-sm mb-4">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-brand-accent text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-accent-dark transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {sortedEvents.map((event) => (
                  <EventCardDiscover key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default DiscoverPage;
