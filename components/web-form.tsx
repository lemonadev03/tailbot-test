"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

interface WebFormProps {
  onSubmit: (formData: {
    name: string
    phone_number: string
    email: string
  }) => void
}

export default function WebForm({ onSubmit }: WebFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    email: "",
  })

  const [errors, setErrors] = useState({
    name: "",
    phone_number: "",
    email: "",
  })

  const validateForm = () => {
    const newErrors = {
      name: "",
      phone_number: "",
      email: "",
    }

    let isValid = true

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
      isValid = false
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required"
      isValid = false
    } else if (!/^\+?[0-9\s\-()]+$/.test(formData.phone_number)) {
      newErrors.phone_number = "Invalid phone number"
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <Card className="p-4 bg-white border shadow-sm">
      <h3 className="text-lg font-medium mb-4">Please provide your details</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
          />
          {errors.phone_number && <p className="text-red-500 text-sm">{errors.phone_number}</p>}
        </div>

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Card>
  )
}
