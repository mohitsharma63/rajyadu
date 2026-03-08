import { useState } from "react";
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { toast } = useToast();

  const [contactInfo, setContactInfo] = useState({
    email: "dhudaramsonsorganic5358@gmail.com",
    phone: "8003845358",
    address: "Majari road, near tvs agany, khtanath gate k pass neemrana kot-bherod raj",
  });

  const [socialLinks, setSocialLinks] = useState({
    facebook: "https://www.facebook.com/share/1Dnbc5YrU9/",
    instagram: "https://www.instagram.com/rajyadu.dhudaramorganics?utm_source=qr&igsh=MW15dTZvZnN6N3c0NA==",
    youtube: "",
    twitter: "",
  });

  const handleContactChange = (field: string, value: string) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (field: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveContact = () => {
    // TODO: Save to backend API
    toast({
      title: "Contact information saved",
      description: "Please update the contact.tsx file with these values manually, or implement backend API.",
    });
  };

  const handleSaveSocial = () => {
    // TODO: Save to backend API
    toast({
      title: "Social media links saved",
      description: "Please update the contact.tsx and layout.tsx files with these values manually, or implement backend API.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your store settings here.</p>
      </div>

      {/* Contact Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={contactInfo.email}
                onChange={(e) => handleContactChange("email", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={contactInfo.phone}
                onChange={(e) => handleContactChange("phone", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="address"
                type="text"
                placeholder="Enter full address"
                value={contactInfo.address}
                onChange={(e) => handleContactChange("address", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button onClick={handleSaveContact} className="w-full sm:w-auto">
            Save Contact Information
          </Button>
        </CardContent>
      </Card>

      {/* Social Media Links Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Social Media Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facebook" className="flex items-center gap-2">
              <Facebook className="h-4 w-4" />
              Facebook URL
            </Label>
            <Input
              id="facebook"
              type="url"
              placeholder="https://www.facebook.com/..."
              value={socialLinks.facebook}
              onChange={(e) => handleSocialChange("facebook", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram URL
            </Label>
            <Input
              id="instagram"
              type="url"
              placeholder="https://www.instagram.com/..."
              value={socialLinks.instagram}
              onChange={(e) => handleSocialChange("instagram", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube" className="flex items-center gap-2">
              <Youtube className="h-4 w-4" />
              YouTube URL
            </Label>
            <Input
              id="youtube"
              type="url"
              placeholder="https://www.youtube.com/..."
              value={socialLinks.youtube}
              onChange={(e) => handleSocialChange("youtube", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter" className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              Twitter URL
            </Label>
            <Input
              id="twitter"
              type="url"
              placeholder="https://www.twitter.com/..."
              value={socialLinks.twitter}
              onChange={(e) => handleSocialChange("twitter", e.target.value)}
            />
          </div>

          <Button onClick={handleSaveSocial} className="w-full sm:w-auto">
            Save Social Media Links
          </Button>
        </CardContent>
      </Card>

      {/* Current Values Display */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>Current Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Email:</p>
            <p className="text-sm text-gray-600">{contactInfo.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Phone:</p>
            <p className="text-sm text-gray-600">{contactInfo.phone}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Address:</p>
            <p className="text-sm text-gray-600">{contactInfo.address}</p>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-gray-700">Social Links:</p>
            <div className="mt-2 space-y-1">
              {socialLinks.facebook && (
                <p className="text-sm text-gray-600">
                  Facebook: <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{socialLinks.facebook}</a>
                </p>
              )}
              {socialLinks.instagram && (
                <p className="text-sm text-gray-600">
                  Instagram: <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{socialLinks.instagram}</a>
                </p>
              )}
              {socialLinks.youtube && (
                <p className="text-sm text-gray-600">
                  YouTube: <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{socialLinks.youtube}</a>
                </p>
              )}
              {socialLinks.twitter && (
                <p className="text-sm text-gray-600">
                  Twitter: <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{socialLinks.twitter}</a>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
