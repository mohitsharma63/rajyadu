import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Shield, 
  Users, 
  Package, 
  CreditCard, 
  Truck, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Info,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout';
import { oliGetJson } from '@/lib/oliApi';

interface SectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const AccordionSection: React.FC<SectionProps> = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="mb-4 overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader 
        className="cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 text-white rounded-lg">
              <Icon className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg text-gray-800 dark:text-gray-200">{title}</CardTitle>
          </div>
          <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="p-6 bg-white dark:bg-gray-800">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

const TermsAndConditions: React.FC = () => {
  const [, setLocation] = useLocation();

  const handleEmailClick = () => {
    window.location.href = 'mailto:support@rajyadu.com?subject=Terms & Conditions Inquiry&body=Hi Rajyadu Team,';
  };

  const handleCallClick = () => {
    window.location.href = 'tel:+919876543210';
  };

  return (
      <div className="min-h-screen bg-gray-900 text-gray-100 dark:bg-gray-900 dark:text-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-green-700 p-2"
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Badge variant="secondary" className="bg-green-500 text-white border-green-400">
                Legal Information
              </Badge>
            </div>
            
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Terms & Conditions
              </h1>
              <p className="text-xl text-green-100 mb-8">
                Welcome to Rajyadu Organic Food. Please read these terms carefully before using our services.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-200" />
                    <span className="font-medium">100% Organic Products</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-green-200" />
                    <span className="font-medium">Fast Delivery</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-200" />
                    <span className="font-medium">Secure Payments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Terms Content */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <AccordionSection 
                  title="Acceptance of Terms" 
                  icon={FileText}
                  defaultOpen={true}
                >
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p>
                      By accessing and using Rajyadu Organic Food's website and services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-900">Important Notice</p>
                          <p className="text-blue-800 text-sm mt-1">
                            These terms apply to all users of our website, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection title="Products & Services" icon={Package}>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Product Information</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>All products are 100% organic and certified by relevant authorities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Product descriptions and images are for illustrative purposes only</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>We reserve the right to modify product specifications without prior notice</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Quality Assurance</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        We are committed to providing the highest quality organic products. All products undergo strict quality control checks before delivery.
                      </p>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection title="User Account & Registration" icon={Users}>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Account Creation</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>You must provide accurate, current, and complete information during registration</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>You are responsible for maintaining the confidentiality of your account credentials</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>You must be at least 18 years old to create an account</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-900">Account Security</p>
                          <p className="text-yellow-800 text-sm mt-1">
                            You agree to notify us immediately of any unauthorized use of your account.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection title="Pricing & Payment" icon={CreditCard}>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Payment Methods</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Cash on Delivery (COD)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>UPI Payments (Google Pay, PhonePe, PayTM)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Debit/Credit Cards</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Net Banking</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Pricing Policy</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        All prices are inclusive of applicable taxes. We reserve the right to modify prices without prior notice. Prices displayed at the time of order confirmation will be final.
                      </p>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection title="Delivery & Shipping" icon={Truck}>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Delivery Areas & Charges</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Within 5km radius: ₹40 delivery charge</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>5km - 15km radius: ₹60 delivery charge</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Beyond 15km: ₹80+ delivery charge (based on distance)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Free delivery on orders above ₹500</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Delivery Timing</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Standard delivery: 6AM-9AM and 5PM-8PM</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Express delivery: Available with additional charges</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Sunday delivery: Limited slots available</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Logistics Partners</h4>
                      <p className="text-gray-600 mb-3">
                        We partner with trusted logistics companies to ensure safe and timely delivery:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="font-medium text-blue-900">Shiprocket</p>
                          <p className="text-sm text-blue-700">Pan India delivery network</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="font-medium text-green-900">Local Delivery Partners</p>
                          <p className="text-sm text-green-700">Same-day delivery in city</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Delivery Process</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Orders confirmed within 30 minutes of placement</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Standard delivery: 4-6 hours within city</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Outstation delivery: 2-3 business days</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Real-time tracking available for all orders</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-900">Important Delivery Notes</p>
                          <ul className="text-amber-800 text-sm mt-1 space-y-1">
                            <li>• Delivery charges may vary during peak hours or bad weather</li>
                            <li>• Orders placed after 8PM will be delivered next morning</li>
                            <li>• Customer must be available at the delivery address</li>
                            <li>• Multiple delivery attempts may incur additional charges</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection title="Privacy & Data Protection" icon={Shield}>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p>
                      We are committed to protecting your privacy and personal information. All data collected is used solely for improving our services and user experience.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>We do not sell or share your personal information with third parties</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>All payment information is encrypted and secure</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>You can request data deletion at any time</span>
                      </li>
                    </ul>
                  </div>
                </AccordionSection>

                <AccordionSection title="Intellectual Property" icon={FileText}>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p>
                      All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Rajyadu Organic Food and is protected by intellectual property laws.
                    </p>
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-900">Copyright Notice</p>
                          <p className="text-red-800 text-sm mt-1">
                            Unauthorized use of our intellectual property may violate copyright, trademark, and other laws.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection title="Limitation of Liability" icon={AlertCircle}>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p>
                      Rajyadu Organic Food shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.
                    </p>
                    <p>
                      Our maximum liability shall not exceed the amount paid for the specific product or service in question.
                    </p>
                  </div>
                </AccordionSection>

                <AccordionSection title="Termination of Service" icon={Users}>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p>
                      We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                    <p>
                      Upon termination, your right to use the Service will cease immediately. All provisions of the Terms which by their nature should survive termination shall survive.
                    </p>
                  </div>
                </AccordionSection>

                <AccordionSection title="Governing Law & Jurisdiction" icon={Shield}>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p>
                      These Terms shall be interpreted and governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in [Your City], India.
                    </p>
                  </div>
                </AccordionSection>

                <AccordionSection title="Changes to Terms" icon={FileText}>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p>
                      We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
                    </p>
                  </div>
                </AccordionSection>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Quick Links */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
                    <CardTitle className="text-lg text-gray-800 dark:text-gray-200">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Link href="/about" className="block p-3 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center gap-2 text-green-700">
                          <Info className="w-4 h-4" />
                          <span className="font-medium">About Us</span>
                        </div>
                      </Link>
                      <Link href="/contact" className="block p-3 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center gap-2 text-green-700">
                          <Phone className="w-4 h-4" />
                          <span className="font-medium">Contact Us</span>
                        </div>
                      </Link>
                      <Link href="/privacy-policy" className="block p-3 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center gap-2 text-green-700">
                          <Shield className="w-4 h-4" />
                          <span className="font-medium">Privacy Policy</span>
                        </div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
                    <CardTitle className="text-lg text-gray-800 dark:text-gray-200">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Phone</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">+91 98765 43210</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Email</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">support@rajyadu.com</p>
                        </div>
                      </div>
                    
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={handleEmailClick}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </Button>
                  </CardContent>
                </Card>

                {/* Last Updated */}
                <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">Last Updated: February 22, 2026</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Questions About Our Terms?</h2>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              If you have any questions about these Terms and Conditions, please don't hesitate to contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-green-600 hover:bg-gray-100"
                onClick={handleEmailClick}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Us
              </Button>
              <Button 
                size="lg" 
                className="bg-white text-green-600 hover:bg-gray-100"
               onClick={handleCallClick}
              >
              <Phone className="w-4 h-4 mr-2" />
                Call Us
              </Button>
             
            </div>
          </div>
        </div>
      </div>
  );
};

export default TermsAndConditions;
