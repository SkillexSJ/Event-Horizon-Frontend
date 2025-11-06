import "../../index.css";
import { Link, useNavigate } from "react-router";
import { useState, useMemo, useEffect } from "react";
import {
  useGetCategories,
  useGetEventsByCategoryName,
} from "../../api/useCategories.ts";
import { useGetAllEvents } from "../../api/useEvent.ts";
import { CloudAlert, Search, SlidersHorizontal, Calendar } from "lucide-react";
import LightRays from "../../Components/LightRays.tsx";
import EventCardSimple from "./EventHomeCard.tsx";

//! Event interface for Home component
interface HomeEvent {
  id: string;
  category_name: string;
  name: string;
  date: string;
  location: string;
  image_url?: string;
  created_at?: string;
  start_time?: string;
  end_time?: string;
}

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const navigate = useNavigate();

  //! Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {}
  );

  //* Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  //! Fetch all categories from database
  const { data: categoriesData } = useGetCategories();

  //! Fetch all events (for "All Events" category)
  const {
    data: allEvents,
    isLoading: allEventsLoading,
    isError: allEventsError,
  } = useGetAllEvents();

  //! Fetch events for selected category
  const {
    data: categoryData,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useGetEventsByCategoryName(activeCategory);

  //? Determine which data to show
  const isLoading =
    activeCategory === "All Events" ? allEventsLoading : categoryLoading;
  const isError =
    activeCategory === "All Events" ? allEventsError : categoryError;

  //! Get events based on selected category
  const displayEvents = useMemo(() => {
    if (activeCategory === "All Events") {
      return allEvents || [];
    }
    return categoryData?.events || [];
  }, [activeCategory, allEvents, categoryData]);

  //! Get featured events
  const featuredEvents = useMemo(() => {
    if (displayEvents.length === 0) return [];

    //? For specific categories, sort by event date
    const sortedEvents = [...displayEvents].sort((a, b) => {
      if (activeCategory === "All Events") {
        //? Sort by created_at if available, otherwise by date
        const aTime = a.created_at
          ? new Date(a.created_at).getTime()
          : new Date(a.date).getTime();
        const bTime = b.created_at
          ? new Date(b.created_at).getTime()
          : new Date(b.date).getTime();
        return bTime - aTime; //! Most recent
      } else {
        //? For specific categories, sort by event date
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    //? For "All Events" get unique event
    if (activeCategory === "All Events") {
      //? AMRA SET NIBO UNIQUE ER JONNO
      const uniqueCategories = new Set<string>();
      const featured: HomeEvent[] = [];

      for (const event of sortedEvents) {
        //! EIKHANE CHECK KORBO KOYTA EVENT DEKHABO
        if (featured.length >= 6) break;

        if (!uniqueCategories.has(event.category_name)) {
          uniqueCategories.add(event.category_name);
          //? Home page e jei data gula dekhabo
          featured.push({
            id: event.id,
            category_name: event.category_name,
            name: event.name,
            date: event.date,
            location: event.location,
            image_url: event.image_url,
            created_at: event.created_at,
            start_time: event.start_time,
            end_time: event.end_time,
          });
        }
      }

      return featured;
    }

    //? For specific categories, 6 events
    return sortedEvents.slice(0, 6).map((event) => ({
      id: event.id,
      category_name: event.category_name,
      name: event.name,
      date: event.date,
      location: event.location,
      image_url: event.image_url,
      created_at: event.created_at,
      start_time: event.start_time,
      end_time: event.end_time,
    }));
  }, [displayEvents, activeCategory]);

  //! categories list from database
  const categories = useMemo(() => {
    const dbCategories = categoriesData?.map((cat) => cat.name) || [];
    return ["All Events", ...dbCategories];
  }, [categoriesData]);

  //! Display limited or all categories
  const displayedCategories = useMemo(() => {
    return showAllCategories ? categories : categories.slice(0, 10);
  }, [categories, showAllCategories]);

  //! Get carousel slides from events
  const carouselSlides = useMemo(() => {
    const eventsWithImages = (allEvents || []).filter(
      (event) =>
        event.image_url &&
        event.image_url.trim() !== "" &&
        event.image_url.startsWith("https://i.ibb.co")
    );
    return eventsWithImages.slice(0, 5); // Show top 5 events with images from ibb.co
  }, [allEvents]);

  //! Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || carouselSlides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, carouselSlides.length]);

  //! Carousel navigation handlers
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const handleSlideClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  const handleImageError = (eventId: string) => {
    setImageErrors((prev) => ({ ...prev, [eventId]: true }));
  };

  return (
    <>
      {/* //! EXTRA */}
      <div
        style={{
          width: "100%",
          height: "600px",
          position: "absolute",
          zIndex: "1",
        }}
      >
        <LightRays
          raysOrigin="top-center"
          raysColor="#FF6FD8"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={3.2}
          followMouse={false}
          mouseInfluence={0.06}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>

      <main className="overflow-x-hidden">
        {/* //! HERO SECTION WITH CAROUSEL */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4 relative z-10">
            {/* Carousel Container */}
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
              {carouselSlides.length === 0 ? (
                // Fallback when no events with images
                <div className="absolute inset-0 bg-linear-to-br from-brand-accent to-brand-accent-dark flex items-center justify-center">
                  <div className="text-center">
                    <Calendar className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 text-white/70" />
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                      Discover Amazing Events
                    </h2>
                    <p className="text-white/80 text-lg">
                      Your next adventure awaits
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Slides */}
                  {carouselSlides.map((event, index) => (
                    <div
                      key={event.id}
                      className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                        index === currentSlide
                          ? "opacity-100 scale-100 z-10"
                          : "opacity-0 scale-105 z-0"
                      }`}
                      onClick={() => handleSlideClick(event.id)}
                      role="button"
                      tabIndex={index === currentSlide ? 0 : -1}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleSlideClick(event.id);
                        }
                      }}
                    >
                      {/* Image */}
                      {event.image_url && !imageErrors[event.id] ? (
                        <img
                          src={event.image_url}
                          alt={event.name}
                          className="w-full h-full object-cover cursor-pointer"
                          onError={() => handleImageError(event.id)}
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-brand-accent to-brand-accent-dark flex items-center justify-center">
                          <Calendar className="w-32 h-32 text-white/50" />
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

                      {/* Event Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12 text-white">
                        <div className="max-w-3xl">
                          <span className="inline-block px-4 py-2 bg-brand-accent rounded-full text-sm font-semibold mb-4 shadow-lg">
                            {event.category_name}
                          </span>
                          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">
                            {event.name}
                          </h2>
                          <p className="text-lg md:text-xl text-white/90 mb-2 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            {new Date(event.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-md md:text-lg text-white/80">
                            📍 {event.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Dots Indicator */}
                  {carouselSlides.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                      {carouselSlides.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            goToSlide(index);
                          }}
                          className={`transition-all duration-300 rounded-full ${
                            index === currentSlide
                              ? "w-8 h-3 bg-white"
                              : "w-3 h-3 bg-white/50 hover:bg-white/75"
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Search Bar Below Carousel */}
            <div className="mt-8 md:mt-12">
              <form className="max-w-3xl mx-auto glass-effect rounded-full p-2.5 shadow-xl">
                <div className="flex items-center w-full">
                  <Search className="w-5 h-5 text-brand-text-dim ml-4 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search for events, artists, or venues..."
                    className="w-full bg-transparent border-none text-brand-text placeholder-brand-text-dim focus:ring-0 text-lg p-2.5"
                  />
                  <button
                    type="submit"
                    className="bg-brand-accent text-white py-2.5 px-8 rounded-full font-semibold hover:bg-brand-accent-dark transition duration-300 shadow-custom-glow shrink-0"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
        {/* //!Category Filter Section  */}
        <section className="py-12 border-y border-white/10">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="flex flex-col  items-center justify-between gap-4 md:gap-8">
              <h2 className="text-lg font-semibold text-brand-text hidden lg:block shrink-0">
                Filter by Category
              </h2>
              <div className="flex-1 w-full">
                <div className="flex flex-wrap gap-3 justify-start lg:justify-center">
                  {displayedCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                        activeCategory === category
                          ? "bg-brand-accent text-white"
                          : "bg-brand-surface text-brand-text-dim hover:bg-brand-accent hover:text-white"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                  {categories.length > 10 && (
                    <button
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 bg-brand-surface text-brand-accent hover:bg-brand-accent hover:text-white border border-brand-accent"
                    >
                      {showAllCategories
                        ? "Show Less"
                        : `See More (${categories.length - 10})`}
                    </button>
                  )}
                </div>
              </div>
              <Link
                to="/discover"
                className="text-brand-text-dim hover:text-brand-text hidden lg:flex items-center transition duration-300 whitespace-nowrap shrink-0"
              >
                <span>View All</span>
                <SlidersHorizontal className="w-5 h-5 ml-1" />
              </Link>
            </div>
          </div>
        </section>
        {/* //!Featured Events Section */}
        <section className="py-24">
          <div className="container mx-auto max-w-7xl px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-12 text-center">
              Featured Events
            </h2>

            {isLoading ? (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
                <p className="text-brand-text-dim mt-4">Loading events...</p>
              </div>
            ) : isError ? (
              <div className="flex items-center flex-col">
                <p className=" text-red-500">
                  Failed to load events. Please try again later.
                </p>
                <CloudAlert size={40} color="red" />
              </div>
            ) : featuredEvents.length === 0 ? (
              <p className="text-center text-brand-text-dim">
                No events available at the moment.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredEvents.map((event) => (
                  <EventCardSimple key={event.id} event={event} />
                ))}
              </div>
            )}

            <div className="text-center mt-16">
              <Link
                to="/discover"
                className="inline-block bg-brand-accent text-white py-3.5 px-10 rounded-full font-semibold text-lg hover:bg-brand-accent-dark transition duration-300 shadow-custom-glow"
              >
                Discover All Events
              </Link>
            </div>
          </div>
        </section>
        {/*  //!HOW IT WORKS  */}
        <section className="py-24 bg-grid">
          <div className="container mx-auto max-w-7xl px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-16">
              Organize or Attend in 3 Steps
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              <div
                className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 transform-translate-y-[-2.5rem]"
                aria-hidden="true"
              >
                <svg width="100%" height="2" className="opacity-30">
                  <line
                    x1="15%"
                    y1="1"
                    x2="85%"
                    y2="1"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="10 10"
                  />
                </svg>
              </div>

              <div className="relative z-10 p-8 bg-brand-surface rounded-2xl border border-white/10 shadow-xl">
                <div className="w-20 h-20 bg-brand-accent text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-bold shadow-custom-glow">
                  1
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-brand-text">
                  Find Your Event
                </h3>
                <p className="text-brand-text-dim text-sm">
                  Use our powerful search and filters to discover events that
                  match your passion.
                </p>
              </div>

              <div className="relative z-10 p-8 bg-brand-surface rounded-2xl border border-white/10 shadow-xl">
                <div className="w-20 h-20 bg-brand-accent text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-bold shadow-custom-glow">
                  2
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-brand-text">
                  Book & Go
                </h3>
                <p className="text-brand-text-dim text-sm">
                  Secure your spot with seamless booking and receive your
                  e-ticket instantly.
                </p>
              </div>

              <div className="relative z-10 p-8 bg-brand-surface rounded-2xl border border-white/10 shadow-xl">
                <div className="w-20 h-20 bg-brand-accent text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-bold shadow-custom-glow">
                  3
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-brand-text">
                  Or Create Yours
                </h3>
                <p className="text-brand-text-dim text-sm">
                  Launch, manage, and promote your own successful event with our
                  pro tools.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
