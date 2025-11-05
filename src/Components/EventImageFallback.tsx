import { Calendar } from "lucide-react";

interface EventImageFallbackProps {
  height?: string;
}

const EventImageFallback = ({
  height = "h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]",
}: EventImageFallbackProps) => {
  return (
    <div
      // Changed the gradient to a deep fuchsia/dark magenta color
      className={`relative w-full ${height} bg-fuchsia-950 flex items-center justify-center`}
    >
      <div className="text-center">
        <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-white/70" />
        </div>
      </div>
    </div>
  );
};

export default EventImageFallback;
