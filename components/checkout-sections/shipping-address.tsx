"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COUNTRIES } from "@/lib/country-data"
import type { FormData } from "@/hooks/use-checkout-form"

interface ShippingAddressProps {
  formData: FormData
  differentBilling: boolean
  onFieldChange: (field: keyof FormData | string, value: string) => void
  onDifferentBillingChange: (checked: boolean) => void
}

export function ShippingAddress({
  formData,
  differentBilling,
  onFieldChange,
  onDifferentBillingChange,
}: ShippingAddressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Address</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => onFieldChange("firstName", e.target.value)}
                placeholder="John"
                autoComplete="given-name"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => onFieldChange("lastName", e.target.value)}
                placeholder="Doe"
                autoComplete="family-name"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={(e) => onFieldChange("address", e.target.value)}
              placeholder="123 Main Street"
              autoComplete="street-address"
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={(e) => onFieldChange("city", e.target.value)}
                placeholder="New York"
                autoComplete="address-level2"
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={(e) => onFieldChange("state", e.target.value)}
                placeholder="NY"
                autoComplete="address-level1"
                required
              />
            </div>
            <div>
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                name="zip"
                value={formData.zip}
                onChange={(e) => onFieldChange("zip", e.target.value)}
                placeholder="10001"
                autoComplete="postal-code"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="country">Country</Label>
            <Select value={formData.country} onValueChange={value => onFieldChange("country", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => onFieldChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                autoComplete="tel"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => onFieldChange("email", e.target.value)}
                placeholder="john@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="differentBilling"
              checked={differentBilling}
              onCheckedChange={checked => onDifferentBillingChange(checked === true)}
            />
            <Label htmlFor="differentBilling">
              Billing address is different from shipping address
            </Label>
          </div>

          {differentBilling && (
            <div className="mt-6 p-6 border rounded-lg bg-muted/30">
              <h3 className="font-semibold mb-4">Billing Address</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billingFirstName">First Name</Label>
                    <Input
                      id="billingFirstName"
                      name="billingFirstName"
                      value={formData.billingFirstName}
                      onChange={(e) => onFieldChange("billingFirstName", e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingLastName">Last Name</Label>
                    <Input
                      id="billingLastName"
                      name="billingLastName"
                      value={formData.billingLastName}
                      onChange={(e) => onFieldChange("billingLastName", e.target.value)}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="billingAddress">Address</Label>
                  <Input
                    id="billingAddress"
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={(e) => onFieldChange("billingAddress", e.target.value)}
                    placeholder="456 Oak Avenue"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="billingCity">City</Label>
                    <Input
                      id="billingCity"
                      name="billingCity"
                      value={formData.billingCity}
                      onChange={(e) => onFieldChange("billingCity", e.target.value)}
                      placeholder="Boston"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingState">State</Label>
                    <Input
                      id="billingState"
                      name="billingState"
                      value={formData.billingState}
                      onChange={(e) => onFieldChange("billingState", e.target.value)}
                      placeholder="MA"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingZip">ZIP Code</Label>
                    <Input
                      id="billingZip"
                      name="billingZip"
                      value={formData.billingZip}
                      onChange={(e) => onFieldChange("billingZip", e.target.value)}
                      placeholder="02101"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="billingCountry">Country</Label>
                  <Select value={formData.billingCountry} onValueChange={value => onFieldChange("billingCountry", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billingPhone">Phone</Label>
                    <Input
                      id="billingPhone"
                      name="billingPhone"
                      type="tel"
                      value={formData.billingPhone}
                      onChange={(e) => onFieldChange("billingPhone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingEmail">Email</Label>
                    <Input
                      id="billingEmail"
                      name="billingEmail"
                      type="email"
                      value={formData.billingEmail}
                      onChange={(e) => onFieldChange("billingEmail", e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 
