import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import { useGetCategories, useCreateCategory } from "../api/useCategories";
import { useCreateEvent, useUpdateEvent, useGetEvent } from "../api/useEvent";
import { useUploadImage } from "../api/useImgBB";
import { useNavigate, useSearchParams } from "react-router";
import {
  CheckCircle,
  Info,
  MapPin,
  Ticket,
  AlertCircle,
  Loader2,
  Check,
  X,
  Plus,
  Star,
  GraduationCap,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { errorToastOptions, toastOptions } from "../utils/constant";

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
  image_url?: string;
  start_time: string; // ISO format
  end_time: string; // ISO format
  tickets: TicketInfo[];
}

interface FormErrors {
  name?: string;
  description?: string;
  category_name?: string;
  date?: string;
  location?: string;
  image_url?: string;
  start_time?: string;
  end_time?: string;
  tickets?: string;
}

const AddEventPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editEventId = searchParams.get("edit");
  const isEditMode = !!editEventId;

  //! Fetch categories from backend
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategories();

  //! Fetch event data if in edit mode
  const { data: eventToEdit, isLoading: eventLoading } = useGetEvent(
    editEventId || ""
  );

  //! Create new category
  const createCategoryMutation = useCreateCategory();

  //! Create new event
  const createEventMutation = useCreateEvent();

  //! Update event
  const updateEventMutation = useUpdateEvent();

  //! Upload image to ImgBB
  const uploadImageMutation = useUploadImage();

  //! STATES
  const [categories, setCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  //! Update local categories state when data is fetched
  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData.map((cat) => cat.name));
    }
  }, [categoriesData]);

  //! Populate form when editing an event
  useEffect(() => {
    if (eventToEdit && isEditMode) {
      setFormData({
        name: eventToEdit.name,
        description: eventToEdit.description,
        category_name: eventToEdit.category_name,
        date: eventToEdit.date.split("T")[0],
        location: eventToEdit.location,
        start_time: eventToEdit.start_time,
        end_time: eventToEdit.end_time,
      });
      setTickets(eventToEdit.tickets);
      if (eventToEdit.image_url) {
        setUploadedImageUrl(eventToEdit.image_url);
        setImagePreview(eventToEdit.image_url);
      }
    }
  }, [eventToEdit, isEditMode]);

  //* TICKET STATES
  const [tickets, setTickets] = useState<TicketInfo[]>([
    { type: "VIP", price: 0, total_quantity: 0, available_quantity: 0 },
    { type: "Regular", price: 0, total_quantity: 0, available_quantity: 0 },
    { type: "Student", price: 0, total_quantity: 0, available_quantity: 0 },
  ]);
  //* FROM STATES
  const [formData, setFormData] = useState<Omit<EventData, "tickets">>({
    name: "",
    description: "",
    category_name: "",
    date: "",
    location: "",
    start_time: "",
    end_time: "",
  });

  //! FORM HANDLER
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    //? Clear error
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (name === "category_name" && value === "add_new") {
      setIsModalOpen(true);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  //! IMAGE UPLOAD HANDLER
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      const errorMsg =
        "Please select a valid image file (JPEG, PNG, GIF, or WebP)";
      setErrors((prev) => ({
        ...prev,
        image_url: errorMsg,
      }));
      toast.error(errorMsg, errorToastOptions);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      const errorMsg = "Image size must be less than 5MB";
      setErrors((prev) => ({
        ...prev,
        image_url: errorMsg,
      }));
      toast.error(errorMsg, errorToastOptions);
      return;
    }

    // Clear any previous errors
    setErrors((prev) => ({ ...prev, image_url: undefined }));

    // Set selected image and create preview
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    toast.success("Image selected successfully!", toastOptions);
  };

  //! UPLOAD IMAGE TO IMGBB
  const handleUploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;

    try {
      const imageUrl = await uploadImageMutation.mutateAsync(selectedImage);
      setUploadedImageUrl(imageUrl);
      return imageUrl;
    } catch (error) {
      console.error("Failed to upload image:", error);
      setErrors((prev) => ({
        ...prev,
        image_url:
          error instanceof Error ? error.message : "Failed to upload image",
      }));
      return null;
    }
  };

  //* REMOVE IMAGE
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setUploadedImageUrl("");
    toast.success("Image removed successfully", toastOptions);
    setErrors((prev) => ({ ...prev, image_url: undefined }));
  };

  //* VALIDATE FORM
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = "Event name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Event name must be at least 3 characters";
    } else if (formData.name.length > 100) {
      newErrors.name = "Event name must be less than 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.category_name) {
      newErrors.category_name = "Category is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = "Event date cannot be in the past";
      }
    }

    if (!formData.start_time) {
      newErrors.start_time = "Start time is required";
    }

    if (!formData.end_time) {
      newErrors.end_time = "End time is required";
    }

    // Validate end time is after start time
    if (formData.start_time && formData.end_time && formData.date) {
      const startDateTime = new Date(`${formData.date}T${formData.start_time}`);
      const endDateTime = new Date(`${formData.date}T${formData.end_time}`);

      if (endDateTime <= startDateTime) {
        newErrors.end_time = "End time must be after start time";
      }
    }

    // Validate at least one ticket type has valid data
    const validTickets = tickets.filter(
      (ticket) => ticket.total_quantity > 0 && ticket.price > 0
    );

    if (validTickets.length === 0) {
      newErrors.tickets =
        "At least one ticket type with price and quantity is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

          // When total_quantity changes
          if (field === "total_quantity") {
            return {
              ...ticket,
              total_quantity: numValue,
              available_quantity: numValue, // Auto-set
            };
          }

          // For other fields
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
        toast.success(
          `Category "${newCategory}" created successfully!`,
          toastOptions
        );
      } catch (error) {
        console.error("Error creating category:", error);
        toast.error(
          "Failed to create category. Please try again.",
          errorToastOptions
        );
      }
    }
  };

  //* ADD FORM
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix all errors before submitting", errorToastOptions);
      // Scroll to first error
      const firstErrorElement = document.querySelector('[data-error="true"]');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    try {
      // Upload image first if selected
      let imageUrl = uploadedImageUrl; // Use already uploaded URL if exists

      if (selectedImage && !uploadedImageUrl) {
        console.log("Uploading image to ImgBB...");
        imageUrl = (await handleUploadImage()) || "";

        if (!imageUrl && selectedImage) {
          // Image upload failed
          toast.error(
            "Failed to upload image. Please try again or continue without an image.",
            errorToastOptions
          );
          return;
        }
      }

      //? Convert date and time to ISO format
      const startDateTime = new Date(`${formData.date}T${formData.start_time}`);
      const endDateTime = new Date(`${formData.date}T${formData.end_time}`);
      const eventDate = new Date(formData.date);

      //? For update: keep existing available_quantity, for create: set to total_quantity
      const validTickets = tickets
        .filter((ticket) => ticket.total_quantity > 0 && ticket.price > 0)
        .map((ticket) => ({
          ...ticket,
          // If editing, preserve available_quantity, otherwise set to total
          available_quantity: isEditMode
            ? ticket.available_quantity
            : ticket.total_quantity,
        }));

      const eventData: EventData = {
        ...formData,
        date: eventDate.toISOString(),
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        image_url: imageUrl, // Add the uploaded image URL
        tickets: validTickets,
      };

      if (isEditMode && editEventId) {
        // Update existing event
        console.log("Updating Event Data:", eventData);
        const response = await updateEventMutation.mutateAsync({
          eventId: editEventId,
          data: eventData,
        });
        console.log("Event updated successfully:", response);
        toast.success(
          "Event updated successfully! Redirecting to dashboard...",
          toastOptions
        );
      } else {
        // Create new event
        console.log("Creating Event Data:", eventData);
        const response = await createEventMutation.mutateAsync(eventData);
        console.log("Event created successfully:", response);
        toast.success(
          "Event created successfully! Redirecting to dashboard...",
          toastOptions
        );
      }

      // Show success message
      setShowSuccess(true);

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
      setErrors({});

      // Reset image states
      setSelectedImage(null);
      setImagePreview("");
      setUploadedImageUrl("");

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Navigate to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    } catch (error: unknown) {
      console.error("Error creating event:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create event";

      // Show error toast
      toast.error(errorMessage, errorToastOptions);

      // Show error in form fields as well
      setErrors({
        name: errorMessage.includes("name") ? errorMessage : undefined,
        category_name: errorMessage.includes("category")
          ? errorMessage
          : undefined,
        date:
          errorMessage.includes("date") || errorMessage.includes("past")
            ? errorMessage
            : undefined,
        end_time: errorMessage.includes("time") ? errorMessage : undefined,
      });

      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-brand-background pt-24 sm:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto">
        {/* //!Loading state */}
        {isEditMode && eventLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
          </div>
        )}

        {/* Show form when not loading */}
        {(!isEditMode || (isEditMode && !eventLoading)) && (
          <>
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gradient mb-4">
                {isEditMode ? "Edit Event" : "Create New Event"}
              </h1>
              <p className="text-base sm:text-lg text-brand-text-dim max-w-2xl mx-auto">
                {isEditMode
                  ? "Update your event details below"
                  : "Fill in the details below to create your event"}
              </p>
            </div>

            {/* //!Success Message */}
            {showSuccess && (
              <div className="mb-8 p-5 bg-green-500/10 border-2 border-green-500/30 rounded-2xl animate-fadeIn shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-7 w-7 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-green-400 font-bold text-lg mb-1">
                      {isEditMode
                        ? "Event Updated Successfully!"
                        : "Event Created Successfully!"}
                    </h3>
                    <p className="text-green-400/90 text-sm">
                      Redirecting to dashboard...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* //!Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-brand-surface rounded-2xl border border-white/10 p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-sm"
            >
              {/* Basic Info */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-brand-text mb-6 flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                    <Info className="h-6 w-6 text-brand-accent" />
                  </div>
                  <span>Basic Information</span>
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Event Name */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-brand-text mb-2">
                      Event Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      data-error={!!errors.name}
                      placeholder="Enter event name"
                      className={`w-full bg-brand-surface/70 text-brand-text px-4 py-3 rounded-xl border ${
                        errors.name
                          ? "border-red-500 focus:border-red-500"
                          : "border-white/10 focus:border-brand-accent"
                      } outline-none transition-all`}
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-brand-text mb-2">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="category_name"
                      value={formData.category_name}
                      onChange={handleChange}
                      disabled={categoriesLoading}
                      data-error={!!errors.category_name}
                      className={`w-full bg-brand-surface/70 text-brand-text px-4 py-3 rounded-xl border ${
                        errors.category_name
                          ? "border-red-500 focus:border-red-500"
                          : "border-white/10 focus:border-brand-accent"
                      } outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option value="">
                        {categoriesLoading ? "Loading..." : "Select category"}
                      </option>
                      {categories.map((cat, i) => (
                        <option key={i} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="add_new" className="text-brand-accent">
                        ➕Add New Category
                      </option>
                    </select>
                    {errors.category_name && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.category_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-brand-text mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  {/* make it expandable */}
                  <textarea
                    rows={7}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    data-error={!!errors.description}
                    placeholder="Describe your event in detail..."
                    className={`w-full bg-brand-surface/70 text-brand-text px-4 py-3  rounded-xl border ${
                      errors.description
                        ? "border-red-500 focus:border-red-500"
                        : "border-white/10 focus:border-brand-accent"
                    } outline-none transition-all resize-none`}
                  ></textarea>
                  <div className="flex justify-between items-center mt-2">
                    {errors.description ? (
                      <p className="text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.description}
                      </p>
                    ) : (
                      <p className="text-sm text-brand-text-dim">
                        {formData.description.length} characters
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Image Section */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-brand-text mb-6 flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-brand-accent" />
                  </div>
                  <span>Event Image</span>
                </h2>

                <div className="space-y-4">
                  {!imagePreview ? (
                    <div className="relative">
                      <input
                        type="file"
                        id="event-image"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="event-image"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-brand-accent/50 transition-all bg-brand-surface/30 hover:bg-brand-surface/50"
                      >
                        <Upload className="h-12 w-12 text-brand-accent mb-4" />
                        <p className="text-brand-text font-semibold mb-2">
                          Click to upload event image
                        </p>
                        <p className="text-sm text-brand-text-dim">
                          JPEG, PNG, GIF or WebP (Max 5MB)
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-brand-accent/30">
                      <img
                        src={imagePreview}
                        alt="Event preview"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        {uploadedImageUrl && (
                          <div className="bg-green-500/90 text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5">
                            <Check className="h-4 w-4" />
                            Uploaded
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-lg transition-all"
                          title="Remove image"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      {!uploadedImageUrl && (
                        <div className="absolute bottom-4 left-4 right-4 bg-blue-500/90 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                          <Info className="h-4 w-4 shrink-0" />
                          <span>
                            Image will be uploaded when you create the event
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {errors.image_url && (
                    <p className="text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.image_url}
                    </p>
                  )}

                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-sm text-blue-300 flex items-start gap-2">
                      <Info className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-bold">Optional:</strong> Add an
                        eye-catching image to make your event stand out. Images
                        are uploaded to ImgBB and will be processed when you
                        create the event.
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Location & Time Section */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-brand-text mb-6 flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-brand-accent" />
                  </div>
                  <span>Location & Schedule</span>
                </h2>

                {/* Location */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-brand-text mb-2">
                    Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    data-error={!!errors.location}
                    placeholder="Venue name or full address"
                    className={`w-full bg-brand-surface/70 text-brand-text px-4 py-3 rounded-xl border ${
                      errors.location
                        ? "border-red-500 focus:border-red-500"
                        : "border-white/10 focus:border-brand-accent"
                    } outline-none transition-all`}
                  />
                  {errors.location && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-brand-text mb-2">
                      Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      data-error={!!errors.date}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full bg-brand-surface/70 text-brand-text px-4 py-3 rounded-xl border ${
                        errors.date
                          ? "border-red-500 focus:border-red-500"
                          : "border-white/10 focus:border-brand-accent"
                      } outline-none transition-all`}
                    />
                    {errors.date && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.date}
                      </p>
                    )}
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-semibold text-brand-text mb-2">
                      Start Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleChange}
                      data-error={!!errors.start_time}
                      className={`w-full bg-brand-surface/70 text-brand-text px-4 py-3 rounded-xl border ${
                        errors.start_time
                          ? "border-red-500 focus:border-red-500"
                          : "border-white/10 focus:border-brand-accent"
                      } outline-none transition-all`}
                    />
                    {errors.start_time && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.start_time}
                      </p>
                    )}
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-semibold text-brand-text mb-2">
                      End Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      name="end_time"
                      value={formData.end_time}
                      onChange={handleChange}
                      data-error={!!errors.end_time}
                      className={`w-full bg-brand-surface/70 text-brand-text px-4 py-3 rounded-xl border ${
                        errors.end_time
                          ? "border-red-500 focus:border-red-500"
                          : "border-white/10 focus:border-brand-accent"
                      } outline-none transition-all`}
                    />
                    {errors.end_time && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.end_time}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ticket Information Section */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-brand-text mb-6 flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                    <Ticket className="h-6 w-6 text-brand-accent" />
                  </div>
                  <span>Ticket Information</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tickets.map((ticket, i) => (
                    <div
                      key={ticket.type}
                      className="bg-linear-to-br from-brand-surface/80 to-brand-surface/40 p-6 rounded-2xl border border-brand-accent/20 hover:border-brand-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-brand-accent/10"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <h4 className="text-lg font-bold text-brand-text flex items-center gap-2">
                          {ticket.type === "VIP" && (
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          )}
                          {ticket.type === "Regular" && (
                            <Ticket className="w-5 h-5 text-brand-accent" />
                          )}
                          {ticket.type === "Student" && (
                            <GraduationCap className="w-5 h-5 text-blue-400" />
                          )}
                          <span>{ticket.type}</span>
                        </h4>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-brand-text mb-2">
                            Price (BDT)
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text font-bold text-lg">
                              $
                            </span>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={ticket.price || ""}
                              onChange={(e) =>
                                handleTicketChange(i, "price", e.target.value)
                              }
                              placeholder="0.00"
                              className="w-full bg-brand-surface/90 text-brand-text pl-9 pr-4 py-3 rounded-xl border border-white/10 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all font-semibold text-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-brand-text mb-2">
                            Total Quantity
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={ticket.total_quantity || ""}
                            onChange={(e) =>
                              handleTicketChange(
                                i,
                                "total_quantity",
                                e.target.value
                              )
                            }
                            placeholder="0"
                            className="w-full bg-brand-surface/90 text-brand-text px-4 py-3 rounded-xl border border-white/10 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all font-semibold text-lg"
                          />
                        </div>

                        {ticket.total_quantity > 0 && ticket.price > 0 && (
                          <div className="pt-4 border-t border-white/20">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-brand-text-dim font-semibold">
                                Total Value:
                              </span>
                              <span className="text-brand-accent font-bold text-xl">
                                $
                                {(ticket.price * ticket.total_quantity).toFixed(
                                  2
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {errors.tickets && (
                  <p className="mt-4 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.tickets}
                  </p>
                )}

                <div className="mt-6 p-5 bg-blue-500/10 border border-blue-500/30 rounded-2xl backdrop-blur-sm">
                  <p className="text-sm text-blue-300 flex items-start gap-3">
                    <Info className="h-6 w-6 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-bold">Tip:</strong> You can leave
                      price and quantity as 0 for ticket types you don't want to
                      offer. At least one ticket type must have a valid price
                      and quantity to create the event.
                    </span>
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 border-t border-white/10 mt-8">
                <button
                  type="button"
                  onClick={() => navigate("/admin/dashboard")}
                  disabled={createEventMutation.isPending}
                  className="w-full sm:w-auto min-w-[180px] px-8 py-3.5 rounded-xl bg-white/5 text-brand-text font-semibold hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <X className="h-5 w-5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createEventMutation.isPending ||
                    updateEventMutation.isPending
                  }
                  className="w-full sm:w-auto min-w-[200px] px-10 py-3.5 rounded-xl bg-linear-to-r from-brand-accent to-brand-accent-dark text-white font-bold shadow-lg hover:shadow-2xl hover:shadow-brand-accent/30 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-lg"
                >
                  {createEventMutation.isPending ||
                  updateEventMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin h-6 w-6 text-white" />
                      {isEditMode ? "Updating Event..." : "Creating Event..."}
                    </>
                  ) : (
                    <>
                      <Check className="h-6 w-6" />
                      {isEditMode ? "Update Event" : "Create Event"}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* //!Add New Category Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50 p-4 animate-fadeIn">
                <div className="bg-brand-surface rounded-2xl border border-white/20 shadow-2xl w-full max-w-md p-8 animate-slideUp">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-accent/10 rounded-full mb-4">
                      <Plus className="h-8 w-8 text-brand-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-gradient">
                      Add New Category
                    </h3>
                    <p className="text-brand-text-dim text-sm mt-2">
                      Create a custom category for your event
                    </p>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-brand-text mb-3">
                      Category Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newCategory.trim()) {
                          handleAddCategory();
                        }
                      }}
                      placeholder="Enter category name"
                      className="w-full bg-brand-surface/70 text-brand-text px-4 py-3.5 rounded-xl border border-white/10 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all text-lg"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setNewCategory("");
                        setFormData((prev) => ({ ...prev, category_name: "" }));
                      }}
                      disabled={createCategoryMutation.isPending}
                      className="flex-1 px-5 py-3.5 rounded-xl bg-white/5 text-brand-text font-semibold hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCategory}
                      disabled={
                        createCategoryMutation.isPending || !newCategory.trim()
                      }
                      className="flex-1 px-6 py-3.5 rounded-xl bg-linear-to-r from-brand-accent to-brand-accent-dark text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                      {createCategoryMutation.isPending ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5 text-white" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5" />
                          Add Category
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AddEventPage;
