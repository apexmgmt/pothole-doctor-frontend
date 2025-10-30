"use client";

import React, { useState, useRef, useEffect } from "react";

import { PlusIcon, XIcon } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Checkbox } from "@/components/ui/checkbox";

const AddEstimateModal = ({ isOpen, onClose, onSave }) => {
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    estimateTitle: "",
    estimateType: "",
    estimateNumber: "",
    serviceType: "",
    estimateLocation: "",
    useCountryOnly: false,
    bidDate: null,
    expirationDate: null,
    customer: "",
    paymentTerms: "",
    assignedEstimator: "",
  });

  const [showAddCustomer, setShowAddCustomer] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  // Handle outside click to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is inside the modal content area
      if (modalRef.current && modalRef.current.contains(event.target)) {
        return; // Don't close if clicking inside modal
      }

      // Check if the click is on any Radix UI elements (select dropdowns, date pickers, etc.)
      const isRadixElement =
        event.target.closest("[data-radix-select-content]") ||
        event.target.closest("[data-radix-select-viewport]") ||
        event.target.closest("[data-radix-select-item]") ||
        event.target.closest("[data-radix-select-trigger]") ||
        event.target.closest("[data-radix-select-scroll-up-button]") ||
        event.target.closest("[data-radix-select-scroll-down-button]") ||
        event.target.closest("[data-radix-popover-content]") ||
        event.target.closest("[data-radix-calendar-root]") ||
        event.target.closest("[data-radix-calendar-cell]") ||
        event.target.closest("[data-radix-calendar-grid]") ||
        event.target.closest("[data-radix-calendar-month]") ||
        event.target.closest("[data-radix-calendar-caption]") ||
        event.target.closest("[data-radix-calendar-nav]") ||
        event.target.closest("[data-radix-calendar-day]") ||
        event.target.closest(".rdp") ||
        event.target.closest(".rdp-day") ||
        event.target.closest(".rdp-button") ||
        event.target.closest(".rdp-nav") ||
        event.target.closest(".rdp-caption");

      // Don't close modal if clicking on Radix UI elements
      if (isRadixElement) {
        return;
      }

      // If we reach here, the click is outside both modal and Radix UI elements
      handleCancel();
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saving estimate:", formData);
    onSave(formData);
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      estimateTitle: "",
      estimateType: "",
      estimateNumber: "",
      serviceType: "",
      estimateLocation: "",
      useCountryOnly: false,
      bidDate: null,
      expirationDate: null,
      customer: "",
      paymentTerms: "",
      assignedEstimator: "",
    });
    setShowAddCustomer(false);
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      company: "",
    });
    onClose();
  };

  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;

    setNewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveNewCustomer = () => {
    if (newCustomer.name && newCustomer.email) {
      // Create a new customer ID based on the name
      const customerId = newCustomer.name.toLowerCase().replace(/\s+/g, "-");
      const customerName = newCustomer.name;

      // Add the new customer to the form data
      setFormData((prev) => ({
        ...prev,
        customer: customerId,
      }));

      // Reset the new customer form
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        company: "",
      });
      setShowAddCustomer(false);
    }
  };

  const handleCancelNewCustomer = () => {
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      company: "",
    });
    setShowAddCustomer(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-bg-2 rounded-lg border border-border p-6 w-full max-w-[400px] mx-4"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-light">Add Estimate</h2>
          <button
            onClick={handleCancel}
            className="text-gray hover:text-light transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Estimate Title */}
          <div className="space-y-2">
            <Label
              htmlFor="estimateTitle"
              className="text-light-2 text-sm font-medium"
            >
              Estimate title
            </Label>
            <Input
              id="estimateTitle"
              name="estimateTitle"
              value={formData.estimateTitle}
              onChange={handleInputChange}
              placeholder="Enter your estimate title"
              className="bg-bg-3 border-border text-light placeholder:text-gray"
            />
          </div>

          {/* Estimate Type and Estimate Number */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="estimateType"
                className="text-light-2 text-sm font-medium"
              >
                Estimate type
              </Label>
              <Select
                value={formData.estimateType}
                onValueChange={(value) =>
                  handleSelectChange("estimateType", value)
                }
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select estimate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="municipal">Municipal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="estimateNumber"
                className="text-light-2 text-sm font-medium"
              >
                Estimate number
              </Label>
              <Input
                id="estimateNumber"
                name="estimateNumber"
                value={formData.estimateNumber}
                onChange={handleInputChange}
                placeholder="Enter estimate number"
                className="bg-bg-3 border-border text-light placeholder:text-gray"
              />
            </div>
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label
              htmlFor="serviceType"
              className="text-light-2 text-sm font-medium"
            >
              Service type
            </Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) =>
                handleSelectChange("serviceType", value)
              }
            >
              <SelectTrigger className="bg-bg-3 border-border text-light">
                <SelectValue placeholder="Select Service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asphalt-repair">Asphalt Repair</SelectItem>
                <SelectItem value="pothole-filling">Pothole Filling</SelectItem>
                <SelectItem value="sealcoating">Sealcoating</SelectItem>
                <SelectItem value="crack-filling">Crack Filling</SelectItem>
                <SelectItem value="resurfacing">Resurfacing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estimate Location */}
          <div className="space-y-2">
            <Label
              htmlFor="estimateLocation"
              className="text-light-2 text-sm font-medium"
            >
              Estimate location
            </Label>
            <Input
              id="estimateLocation"
              name="estimateLocation"
              value={formData.estimateLocation}
              onChange={handleInputChange}
              placeholder="Enter estimate location"
              className="bg-bg-3 border-border text-light placeholder:text-gray"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="useCountryOnly"
              checked={formData.useCountryOnly}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, useCountryOnly: checked }))
              }
              className="border-border bg-bg-3 text-primary focus:ring-primary"
            />
            <Label htmlFor="useCountryOnly" className="text-light-2 text-sm">
              Use country only
            </Label>
          </div>

          {/* Bid Date and Expiration Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="bidDate"
                className="text-light-2 text-sm font-medium"
              >
                Select bid date
              </Label>
              <DatePicker
                value={formData.bidDate}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, bidDate: date }))
                }
                placeholder="Date"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="expirationDate"
                className="text-light-2 text-sm font-medium"
              >
                Expiration date
              </Label>
              <DatePicker
                value={formData.expirationDate}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, expirationDate: date }))
                }
                placeholder="Date"
              />
            </div>
          </div>

          {/* Customer */}
          <div className="space-y-2">
            <Label
              htmlFor="customer"
              className="text-light-2 text-sm font-medium"
            >
              Customer
            </Label>
            <div className="flex gap-2">
              <Select
                value={formData.customer}
                onValueChange={(value) => handleSelectChange("customer", value)}
              >
                <SelectTrigger className="bg-bg-3 border-border text-light flex-1">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethan-bennett">Ethan Bennett</SelectItem>
                  <SelectItem value="john-smith">John Smith</SelectItem>
                  <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                  <SelectItem value="mike-wilson">Mike Wilson</SelectItem>
                  <SelectItem value="lisa-brown">Lisa Brown</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="border-border text-light hover:bg-bg-3"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="space-y-2">
            <Label
              htmlFor="paymentTerms"
              className="text-light-2 text-sm font-medium"
            >
              Payment terms
            </Label>
            <Select
              value={formData.paymentTerms}
              onValueChange={(value) =>
                handleSelectChange("paymentTerms", value)
              }
            >
              <SelectTrigger className="bg-bg-3 border-border text-light">
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net-30">Net 30</SelectItem>
                <SelectItem value="net-15">Net 15</SelectItem>
                <SelectItem value="due-on-receipt">Due on Receipt</SelectItem>
                <SelectItem value="cash-on-delivery">
                  Cash on Delivery
                </SelectItem>
                <SelectItem value="50-50">
                  50% Upfront, 50% on Completion
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assigned Estimator */}
          <div className="space-y-2">
            <Label
              htmlFor="assignedEstimator"
              className="text-light-2 text-sm font-medium"
            >
              Assigned estimator
            </Label>
            <Select
              value={formData.assignedEstimator}
              onValueChange={(value) =>
                handleSelectChange("assignedEstimator", value)
              }
            >
              <SelectTrigger className="bg-bg-3 border-border text-light">
                <SelectValue placeholder="Select estimator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="john-doe">John Doe</SelectItem>
                <SelectItem value="jane-smith">Jane Smith</SelectItem>
                <SelectItem value="mike-wilson">Mike Wilson</SelectItem>
                <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 border-border text-light hover:bg-bg-3"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-white text-black hover:bg-gray-100"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddEstimateModal;
