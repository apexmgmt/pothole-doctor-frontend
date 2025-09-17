"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon } from "lucide-react";


const Estimates = () => {



  // Single form state with all fields
  const [formData, setFormData] = useState({
    // Customer fields
    location: "",
    contactType: "",
    firstName: "",
    company: "",
    phone: "",
    email: "",
    desiredService: "",
    installationRequest: "",
    comment: "",
    leadCost: "",
    salesRep: "",
    leadSource: "",
    lastName: "",
    displayName: "",
    mainPhone: "",
    bestTimeToReach: "",
    spouseName: "",
    spousePhone: "",
    interestLevel: "",
    preQualifiedFinanceAmount: "",
    // Address fields
    status: "",
    addressTitle: "",
    searchAddress: "",
    streetAddress: "",
    state: "",
    taxExempt: "",
    lead: "",
    city: "",
    zipCode: "",
    country: "",
    subdivisionName: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saving form:", formData);
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      location: "",
      contactType: "",
      firstName: "",
      company: "",
      phone: "",
      email: "",
      desiredService: "",
      installationRequest: "",
      comment: "",
      leadCost: "",
      salesRep: "",
      leadSource: "",
      lastName: "",
      displayName: "",
      mainPhone: "",
      bestTimeToReach: "",
      spouseName: "",
      spousePhone: "",
      interestLevel: "",
      preQualifiedFinanceAmount: "",
      status: "",
      addressTitle: "",
      searchAddress: "",
      streetAddress: "",
      state: "",
      taxExempt: "",
      lead: "",
      city: "",
      zipCode: "",
      country: "",
      subdivisionName: "",
    });
  };

  return (
    <div className="p-6">
      <div className="bg-bg-2 rounded-lg border border-border p-6 w-full max-w-4xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-light">Add New Customer</h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="text-light-2 text-sm font-medium"
              >
                Location
              </Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleSelectChange("location", value)}
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="columbus">Columbus</SelectItem>
                  <SelectItem value="cleveland">Cleveland</SelectItem>
                  <SelectItem value="cincinnati">Cincinnati</SelectItem>
                  <SelectItem value="akron">Akron</SelectItem>
                  <SelectItem value="toledo">Toledo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="contactType"
                className="text-light-2 text-sm font-medium"
              >
                Contact Type
              </Label>
              <Select
                value={formData.contactType}
                onValueChange={(value) =>
                  handleSelectChange("contactType", value)
                }
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select contact type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-light-2 text-sm font-medium"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
                className="bg-bg-3 border-border text-light placeholder:text-gray"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="company"
                className="text-light-2 text-sm font-medium"
              >
                Company
              </Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Enter company name"
                className="bg-bg-3 border-border text-light placeholder:text-gray"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-light-2 text-sm font-medium"
              >
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="bg-bg-3 border-border text-light placeholder:text-gray"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-light-2 text-sm font-medium"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="bg-bg-3 border-border text-light placeholder:text-gray"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="desiredService"
                className="text-light-2 text-sm font-medium"
              >
                Desired Service
              </Label>
              <Select
                value={formData.desiredService}
                onValueChange={(value) =>
                  handleSelectChange("desiredService", value)
                }
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select desired service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asphalt-repair">Asphalt Repair</SelectItem>
                  <SelectItem value="pothole-filling">
                    Pothole Filling
                  </SelectItem>
                  <SelectItem value="sealcoating">Sealcoating</SelectItem>
                  <SelectItem value="crack-filling">Crack Filling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="installationRequest"
                className="text-light-2 text-sm font-medium"
              >
                Installation Request
              </Label>
              <Select
                value={formData.installationRequest}
                onValueChange={(value) =>
                  handleSelectChange("installationRequest", value)
                }
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select installation request" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="within-week">Within Week</SelectItem>
                  <SelectItem value="within-month">Within Month</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="comment"
                className="text-light-2 text-sm font-medium"
              >
                Comment
              </Label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                placeholder="Write here..."
                rows={3}
                className="flex w-full rounded-md border border-border bg-bg-3 px-3 py-2 text-sm text-light placeholder:text-gray focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="leadCost"
                className="text-light-2 text-sm font-medium"
              >
                Lead Cost
              </Label>
              <Select
                value={formData.leadCost}
                onValueChange={(value) => handleSelectChange("leadCost", value)}
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select lead cost" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-500">$0 - $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                  <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                  <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                  <SelectItem value="5000+">$5,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="text-light-2 text-sm font-medium"
              >
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="addressTitle"
                className="text-light-2 text-sm font-medium"
              >
                Address Title
              </Label>
              <Input
                id="addressTitle"
                name="addressTitle"
                value={formData.addressTitle}
                onChange={handleInputChange}
                placeholder="Enter address title"
                className="bg-bg-3 border-border text-light placeholder:text-gray"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="searchAddress"
                className="text-light-2 text-sm font-medium"
              >
                Search Address
              </Label>
              <div className="relative">
                <Input
                  id="searchAddress"
                  name="searchAddress"
                  value={formData.searchAddress}
                  onChange={handleInputChange}
                  placeholder="Search"
                  className="bg-bg-3 border-border text-light placeholder:text-gray pr-10"
                />
                <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray" />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="streetAddress"
                className="text-light-2 text-sm font-medium"
              >
                Street Address
              </Label>
              <Select
                value={formData.streetAddress}
                onValueChange={(value) =>
                  handleSelectChange("streetAddress", value)
                }
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select street address" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="123-main-st">123 Main St</SelectItem>
                  <SelectItem value="456-oak-ave">456 Oak Ave</SelectItem>
                  <SelectItem value="789-pine-st">789 Pine St</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="state"
                className="text-light-2 text-sm font-medium"
              >
                State
              </Label>
              <Select
                value={formData.state}
                onValueChange={(value) => handleSelectChange("state", value)}
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ohio">Ohio</SelectItem>
                  <SelectItem value="kentucky">Kentucky</SelectItem>
                  <SelectItem value="indiana">Indiana</SelectItem>
                  <SelectItem value="pennsylvania">Pennsylvania</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="taxExempt"
                className="text-light-2 text-sm font-medium"
              >
                Tax Exempt
              </Label>
              <Select
                value={formData.taxExempt}
                onValueChange={(value) =>
                  handleSelectChange("taxExempt", value)
                }
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select tax exempt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="salesRep"
                className="text-light-2 text-sm font-medium"
              >
                Sales Rep
              </Label>
              <Select
                value={formData.salesRep}
                onValueChange={(value) => handleSelectChange("salesRep", value)}
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select sales rep" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john-doe">John Doe</SelectItem>
                  <SelectItem value="jane-smith">Jane Smith</SelectItem>
                  <SelectItem value="mike-wilson">Mike Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="leadSource"
                className="text-light-2 text-sm font-medium"
              >
                Lead Source
              </Label>
              <Select
                value={formData.leadSource}
                onValueChange={(value) =>
                  handleSelectChange("leadSource", value)
                }
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select lead source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="cold-call">Cold Call</SelectItem>
                  <SelectItem value="social-media">Social Media</SelectItem>
                  <SelectItem value="trade-show">Trade Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-light-2 text-sm font-medium"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last Name"
                className="bg-bg-3 border-border text-light placeholder:text-gray"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="displayName"
                className="text-light-2 text-sm font-medium"
              >
                Display Name
              </Label>
              <Input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Enter display Name"
                className="bg-bg-3 border-border text-light placeholder:text-gray"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="mainPhone"
                className="text-light-2 text-sm font-medium"
              >
                Main Phone
              </Label>
              <Input
                id="mainPhone"
                name="mainPhone"
                value={formData.mainPhone}
                onChange={handleInputChange}
                placeholder="Enter main phone"
                className="bg-bg-3 border-border text-light placeholder:text-gray"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="bestTimeToReach"
                className="text-light-2 text-sm font-medium"
              >
                Best Time To Reach
              </Label>
              <Input
                id="bestTimeToReach"
                name="bestTimeToReach"
                value={formData.bestTimeToReach}
                onChange={handleInputChange}
                placeholder="Enter best time to reach"
                className="bg-bg-3 border-border text-light placeholder:text-gray"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="spouseName"
                className="text-light-2 text-sm font-medium"
              >
                Spouse Name
              </Label>
              <Input
                id="spouseName"
                name="spouseName"
                value={formData.spouseName}
                onChange={handleInputChange}
                placeholder="Enter spouse name"
                className="bg-bg-3 border-border text-light placeholder:text-gray"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="spousePhone"
                className="text-light-2 text-sm font-medium"
              >
                Spouse Phone
              </Label>
              <Input
                id="spousePhone"
                name="spousePhone"
                value={formData.spousePhone}
                onChange={handleInputChange}
                placeholder="Enter spouse phone"
                className="bg-bg-3 border-border text-light placeholder:text-gray"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="interestLevel"
                className="text-light-2 text-sm font-medium"
              >
                Interest Level
              </Label>
              <Select
                value={formData.interestLevel}
                onValueChange={(value) =>
                  handleSelectChange("interestLevel", value)
                }
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select interest level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="preQualifiedFinanceAmount"
                className="text-light-2 text-sm font-medium"
              >
                Pre-Qualified Finance Amount
              </Label>
              <Input
                id="preQualifiedFinanceAmount"
                name="preQualifiedFinanceAmount"
                value={formData.preQualifiedFinanceAmount}
                onChange={handleInputChange}
                placeholder="Select amount"
                className="bg-bg-3 border-border text-light placeholder:text-gray"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="lead"
                className="text-light-2 text-sm font-medium"
              >
                Lead
              </Label>
              <Select
                value={formData.lead}
                onValueChange={(value) => handleSelectChange("lead", value)}
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="city"
                className="text-light-2 text-sm font-medium"
              >
                City
              </Label>
              <Select
                value={formData.city}
                onValueChange={(value) => handleSelectChange("city", value)}
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="columbus">Columbus</SelectItem>
                  <SelectItem value="cleveland">Cleveland</SelectItem>
                  <SelectItem value="cincinnati">Cincinnati</SelectItem>
                  <SelectItem value="akron">Akron</SelectItem>
                  <SelectItem value="toledo">Toledo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="zipCode"
                className="text-light-2 text-sm font-medium"
              >
                ZIP Code
              </Label>
              <Select
                value={formData.zipCode}
                onValueChange={(value) => handleSelectChange("zipCode", value)}
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select zip code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="43215">43215</SelectItem>
                  <SelectItem value="44101">44101</SelectItem>
                  <SelectItem value="45202">45202</SelectItem>
                  <SelectItem value="44308">44308</SelectItem>
                  <SelectItem value="43604">43604</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="country"
                className="text-light-2 text-sm font-medium"
              >
                Country
              </Label>
              <Select
                value={formData.country}
                onValueChange={(value) => handleSelectChange("country", value)}
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usa">United States</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="subdivisionName"
                className="text-light-2 text-sm font-medium"
              >
                Subdivision Name
              </Label>
              <Select
                value={formData.subdivisionName}
                onValueChange={(value) =>
                  handleSelectChange("subdivisionName", value)
                }
              >
                <SelectTrigger className="bg-bg-3 border-border text-light">
                  <SelectValue placeholder="Select subdivision name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oak-hills">Oak Hills</SelectItem>
                  <SelectItem value="maple-grove">Maple Grove</SelectItem>
                  <SelectItem value="pine-valley">Pine Valley</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          <Button
            variant="secondary"
            onClick={handleSave}
            className="flex-1 bg-bg-3 text-light hover:bg-bg-4"
          >
            Save
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 border-border text-light hover:bg-bg-3"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Estimates;
