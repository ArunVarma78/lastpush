import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { InterviewType } from "@/services/Constants";
import { ArrowRight } from "lucide-react";

function FormContainer({ onHandleInputChange, GoToNext }) {
  const [interviewType, setInterviewType] = useState([]);
  const [formValues, setFormValues] = useState({
    jobPosition: "",
    jobDescription: "",
    duration: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (interviewType.length > 0) {
      onHandleInputChange("type", interviewType);
    }
  }, [interviewType]);

  const validateForm = () => {
    const newErrors = {};

    if (!formValues.jobPosition.trim()) {
      newErrors.jobPosition = "Job position is required";
    } else if (formValues.jobPosition.trim().length < 3) {
      newErrors.jobPosition = "Job position must be at least 3 characters";
    } else if (formValues.jobPosition.trim().length > 200) {
      newErrors.jobPosition = "Job position must be less than 200 characters";
    }

    if (!formValues.jobDescription.trim()) {
      newErrors.jobDescription = "Job description is required";
    } else if (formValues.jobDescription.trim().length < 20) {
      newErrors.jobDescription =
        "Job description must be at least 20 characters";
    } else if (formValues.jobDescription.trim().length > 5000) {
      newErrors.jobDescription =
        "Job description must be less than 5000 characters";
    }

    if (!formValues.duration) {
      newErrors.duration = "Please select interview duration";
    }

    if (interviewType.length === 0) {
      newErrors.type = "Please select at least one interview type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    // Sanitize input
    let sanitizedValue = String(value);

    if (field === "jobPosition" && value > 200) {
      sanitizedValue = sanitizedValue.slice(0, 200);
    } else if (field === "jobDescription" && sanitizedValue.length > 5000) {
      sanitizedValue = sanitizedValue.slice(0, 5000);
    }

    setFormValues((prev) => ({ ...prev, [field]: sanitizedValue }));
    onHandleInputChange(field, sanitizedValue);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const AddInterviewType = (type) => {
    const isSelected = interviewType.includes(type);
    if (!isSelected) {
      setInterviewType((prev) => [...prev, type]);
    } else {
      setInterviewType((prev) => prev.filter((item) => item !== type));
    }
    // Clear error when type is selected
    if (errors.type) {
      setErrors((prev) => ({ ...prev, type: "" }));
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      GoToNext();
    }
  };

  return (
    <div className="p-6 md:p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="space-y-6">
        {/* Job Position */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Job Position <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. Full Stack Developer"
            className={`mt-2 ${errors.jobPosition ? "border-red-500" : ""}`}
            value={formValues.jobPosition}
            onChange={(event) =>
              handleInputChange("jobPosition", event.target.value)
            }
            maxLength={200}
          />
          {errors.jobPosition && (
            <p className="text-red-500 text-xs mt-1">{errors.jobPosition}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formValues.jobPosition.length}/200 characters
          </p>
        </div>

        {/* Job Description */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Job Description <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Enter job description and requirements..."
            className={`h-[200px] mt-2 ${errors.jobDescription ? "border-red-500" : ""}`}
            value={formValues.jobDescription}
            onChange={(event) =>
              handleInputChange("jobDescription", event.target.value)
            }
            maxLength={5000}
          />
          {errors.jobDescription && (
            <p className="text-red-500 text-xs mt-1">{errors.jobDescription}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formValues.jobDescription.length}/5000 characters
          </p>
        </div>

        {/* Duration */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Interview Duration <span className="text-red-500">*</span>
          </label>
          <Select
            onValueChange={(value) => handleInputChange("duration", value)}
            value={formValues.duration}
          >
            <SelectTrigger
              className={`w-full mt-2 ${errors.duration ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15 min">15 min</SelectItem>
              <SelectItem value="30 min">30 min</SelectItem>
              <SelectItem value="45 min">45 min</SelectItem>
            </SelectContent>
          </Select>
          {errors.duration && (
            <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
          )}
        </div>

        {/* Interview Type */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Interview Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3 flex-wrap mt-2">
            {InterviewType.map((type, index) => (
              <button
                key={index}
                type="button"
                className={`flex items-center gap-2 px-4 py-2 border-2 rounded-xl transition-all hover:scale-105 ${
                  interviewType.includes(type.title)
                    ? "bg-blue-500 text-white border-transparent shadow-md"
                    : "border-gray-300 hover:border-blue-300 text-gray-700"
                }`}
                onClick={() => AddInterviewType(type.title)}
              >
                <type.icon className="h-4 w-4" />
                <span className="font-medium">{type.title}</span>
              </button>
            ))}
          </div>
          {errors.type && (
            <p className="text-red-500 text-xs mt-1">{errors.type}</p>
          )}
          {interviewType.length > 0 && (
            <p className="text-xs text-green-600 mt-1">
              {interviewType.length} type(s) selected
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-8 pt-6 border-t">
          <Button
            className="px-8 bg-blue-600 hover:bg-blue-700"
            onClick={handleNext}
          >
            Generate Questions <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FormContainer;
