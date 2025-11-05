import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import { useGetCategories, useCreateCategory } from "../api/useCategories";
import { useCreateEvent } from "../api/useEvent";

interface TicketInfo {
  type: "VIP" | "Regular" | "Student";
  price: number;
  total_quantity: number;
  available_quantity: number;
}

interface EventData {
  category_name: string;
  name: string;
  description: string;
  date: string; // ISO format
  location: string;
  start_time: string; // ISO format
  end_time: string; // ISO format
  tickets: TicketInfo[];
}

const EventForm = () => {
  //! Fetch categories from backend
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategories();

  //! Create new category
  const createCategoryMutation = useCreateCategory();

  //! Create new event
  const createEventMutation = useCreateEvent();

  const [categories, setCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  //! Update local categories state when data is fetched
  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData.map((cat) => cat.name));
    }
  }, [categoriesData]);

  //* TICKET STATES
  const [tickets, setTickets] = useState<TicketInfo[]>([
    { type: "VIP", price: 0, total_quantity: 0, available_quantity: 0 },
    { type: "Regular", price: 0, total_quantity: 0, available_quantity: 0 },
    { type: "Student", price: 0, total_quantity: 0, available_quantity: 0 },
  ]);

  const [formData, setFormData] = useState<Omit<EventData, "tickets">>({
    name: "",
    description: "",
    category_name: "",
    date: "",
    location: "",
    start_time: "",
    end_time: "",
  });

  // HERE YOU WILL FETCH ALL THE CATEGORIES FROM THE BACKEND AND SET THEM IN THE STATE

  //* FORM HANDLER
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "category_name" && value === "add_new") {
      setIsModalOpen(true);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  //* TICKET HANDLER
  const handleTicketChange = (
    index: number,
    field: keyof TicketInfo,
    value: string
  ) => {
    setTickets((prev) => {
      return prev.map((ticket, i) => {
        if (i === index) {
          const numValue = Number(value);

          // When total_quantity changes, update available_quantity to match
          if (field === "total_quantity") {
            return {
              ...ticket,
              total_quantity: numValue,
              available_quantity: numValue, // Auto-set available to match total
            };
          }

          // For other fields, update normally
          return {
            ...ticket,
            [field]:
              field === "price" || field === "available_quantity"
                ? numValue
                : value,
          };
        }
        return ticket;
      });
    });
  };

  //* ADD CATEGORY
  const handleAddCategory = async () => {
    if (newCategory.trim() !== "") {
      try {
        //! Send POST request to backend
        await createCategoryMutation.mutateAsync({ name: newCategory });

        //! Update form data with new category
        setFormData((prev) => ({ ...prev, category_name: newCategory }));
        setNewCategory("");
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error creating category:", error);
        alert("Failed to create category. Please try again.");
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    //? Convert date and time to ISO format
    const startDateTime = new Date(`${formData.date}T${formData.start_time}`);
    const endDateTime = new Date(`${formData.date}T${formData.end_time}`);
    const eventDate = new Date(formData.date);

    //? Filter out tickets with 0 quantity or price and ensure available_quantity = total_quantity
    const validTickets = tickets
      .filter((ticket) => ticket.total_quantity > 0 && ticket.price > 0)
      .map((ticket) => ({
        ...ticket,
        available_quantity: ticket.total_quantity, // Ensure available equals total on creation
      }));

    const eventData: EventData = {
      ...formData,
      date: eventDate.toISOString(),
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      tickets: validTickets,
    };

    try {
      console.log("Submitting Event Data:", eventData);
      const response = await createEventMutation.mutateAsync(eventData);
      console.log("Event created successfully:", response);
      alert("Event created successfully! 🎉");

      // Reset form after successful submission
      setFormData({
        name: "",
        description: "",
        category_name: "",
        date: "",
        location: "",
        start_time: "",
        end_time: "",
      });
      setTickets([
        { type: "VIP", price: 0, total_quantity: 0, available_quantity: 0 },
        { type: "Regular", price: 0, total_quantity: 0, available_quantity: 0 },
        { type: "Student", price: 0, total_quantity: 0, available_quantity: 0 },
      ]);
    } catch (error: unknown) {
      console.error("Error creating event:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create event";
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg bg-grid text-brand-text font-sand flex justify-center px-8 py-12">
      <div className="w-full max-w-6xl">
        <h2 className="text-4xl font-bold mb-10 text-gradient text-center">
          Create New Event
        </h2>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="col-span-2">
              <label className="block text-sm mb-2 text-brand-text-dim">
                Event Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter event name"
                className="w-full bg-brand-surface/70 text-brand-text px-4 py-3 rounded-lg border border-transparent focus:border-brand-accent outline-none transition"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm mb-2 text-brand-text-dim">
                Category
              </label>
              <select
                name="category_name"
                value={formData.category_name}
                onChange={handleChange}
                disabled={categoriesLoading}
                className="w-full bg-brand-surface/70 text-brand-text px-4 py-3 rounded-lg border border-transparent focus:border-brand-accent outline-none transition disabled:opacity-50"
              >
                <option value="">
                  {categoriesLoading ? "Loading..." : "Select category"}
                </option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}

                {/* //*Add New Category */}

                <option value="add_new" className="text-brand-accent">
                  ➕ Add new category
                </option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-2 text-brand-text-dim">
              Description
            </label>
            <textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write event details..."
              className="w-full bg-brand-surface/70 text-brand-text px-4 py-3 rounded-lg border border-transparent focus:border-brand-accent outline-none transition resize-none"
            ></textarea>
          </div>

          {/* Location & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <label className="block text-sm mb-2 text-brand-text-dim">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Venue or address"
                className="w-full bg-brand-surface/70 text-brand-text px-4 py-3 rounded-lg border border-transparent focus:border-brand-accent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-brand-text-dim">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-brand-surface/70 text-brand-text px-4 py-3 rounded-lg border border-transparent focus:border-brand-accent outline-none transition"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-2 text-brand-text-dim">
                  Start Time
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full bg-brand-surface/70 text-brand-text px-4 py-3 rounded-lg border border-transparent focus:border-brand-accent outline-none transition"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-2 text-brand-text-dim">
                  End Time
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full bg-brand-surface/70 text-brand-text px-4 py-3 rounded-lg border border-transparent focus:border-brand-accent outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Ticket Info */}
          <div>
            <h3 className="text-2xl font-semibold text-gradient mb-6">
              Ticket Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tickets.map((ticket, i) => (
                <div
                  key={ticket.type}
                  className="bg-brand-surface/60 p-5 rounded-xl border border-brand-accent/20 hover:border-brand-accent transition"
                >
                  <h4 className="text-lg font-semibold mb-3">{ticket.type}</h4>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs mb-2 text-brand-text-dim">
                        Price (BDT)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={ticket.price}
                        onChange={(e) =>
                          handleTicketChange(i, "price", e.target.value)
                        }
                        placeholder="e.g. 50"
                        className="w-full bg-brand-surface text-brand-text px-3 py-2 rounded-md border border-transparent focus:border-brand-accent outline-none transition"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs mb-2 text-brand-text-dim">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={ticket.total_quantity}
                        onChange={(e) =>
                          handleTicketChange(
                            i,
                            "total_quantity",
                            e.target.value
                          )
                        }
                        placeholder="e.g. 100"
                        className="w-full bg-brand-surface text-brand-text px-3 py-2 rounded-md border border-transparent focus:border-brand-accent outline-none transition"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={createEventMutation.isPending}
              className="px-10 py-3 rounded-xl bg-linear-to-r from-brand-accent to-brand-accent-dark text-white font-semibold shadow-custom-shadow hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {createEventMutation.isPending
                ? "Creating Event..."
                : "Submit Event"}
            </button>
          </div>
        </form>
      </div>

      {/* Add New Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="glass-effect p-8 rounded-2xl w-[90%] max-w-md">
            <h3 className="text-2xl font-semibold text-gradient mb-6 text-center">
              Add New Category
            </h3>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category name"
              className="w-full bg-brand-surface text-brand-text px-4 py-3 rounded-lg border border-transparent focus:border-brand-accent outline-none transition mb-6"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={createCategoryMutation.isPending}
                className="px-4 py-2 rounded-lg bg-brand-surface text-brand-text-dim hover:text-brand-text transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={createCategoryMutation.isPending}
                className="px-5 py-2 rounded-lg bg-linear-to-r from-brand-accent to-brand-accent-dark text-white font-semibold shadow-custom-shadow hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {createCategoryMutation.isPending ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventForm;
