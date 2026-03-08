import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Shield, 
  Lock, 
  Database, 
  Cookie, 
  UserCheck, 
  Eye, 
  Mail, 
  Phone,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  CheckCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout';

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
        className="cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
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

const PrivacyPolicy: React.FC = () => {
  const [, setLocation] = useLocation();

  const handleEmailClick = () => {
    window.location.href = 'mailto:support@rajyadu.com?subject=Privacy Policy Inquiry&body=Hi Rajyadu Team,';
  };

  const handleCallClick = () => {
    window.location.href = 'tel:+919876543210';
  };

  return (
      <div className="min-h-screen bg-gray-900 text-gray-100 dark:bg-gray-900 dark:text-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-blue-700 p-2"
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Badge variant="secondary" className="bg-blue-500 text-white border-blue-400">
                Privacy Policy
              </Badge>
            </div>
            
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Privacy Policy
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-200" />
                    <span className="font-medium">Data Protection</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-blue-200" />
                    <span className="font-medium">Secure Storage</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-blue-200" />
                    <span className="font-medium">User Control</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Privacy Content */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <AccordionSection 
                  title="Information We Collect" 
                  icon={Database}
                  defaultOpen={true}
                >
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Personal Information</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Name, email address, and phone number</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Delivery address and location data</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Payment information (processed securely)</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Usage Information</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Browsing history and website interactions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Order history and preferences</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Device and browser information</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection title="How We Use Your Information" icon={Eye}>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Service Provision</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Process and deliver your orders</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Provide customer support</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Send order updates and notifications</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Service Improvement</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Analyze usage patterns to improve our services</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Personalize your experience</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Develop new features and services</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection title="Data Security & Protection" icon={Lock}>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p>
                      We implement industry-standard security measures to protect your information:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>SSL encryption for all data transmissions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Secure payment processing through trusted gateways</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Regular security audits and updates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Limited employee access to sensitive data</span>
                      </li>
                    </ul>
                  </div>
                </AccordionSection>

                <AccordionSection title="Cookies & Tracking" icon={Cookie}>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p>
                      We use cookies and similar technologies to enhance your experience:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Essential cookies for website functionality</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Analytics cookies to understand usage patterns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Marketing cookies for personalized content</span>
                      </li>
                    </ul>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You can control cookie settings through your browser preferences.
                    </p>
                  </div>
                </AccordionSection>

                <AccordionSection title="Your Rights & Choices" icon={UserCheck}>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Data Control Rights</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Access your personal information</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Correct inaccurate information</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Delete your account and data</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Opt-out of marketing communications</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection title="Third-Party Sharing" icon={Shield}>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p>
                      We may share your information only in specific circumstances:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Payment processors for transaction completion</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Delivery partners for order fulfillment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Legal authorities when required by law</span>
                      </li>
                    </ul>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We never sell your personal information to third parties.
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
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                    <CardTitle className="text-lg text-gray-800 dark:text-gray-200">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Link href="/about" className="block p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Info className="w-4 h-4" />
                          <span className="font-medium">About Us</span>
                        </div>
                      </Link>
                      <Link href="/contact" className="block p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Phone className="w-4 h-4" />
                          <span className="font-medium">Contact Us</span>
                        </div>
                      </Link>
                      <Link href="/terms-conditions" className="block p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Shield className="w-4 h-4" />
                          <span className="font-medium">Terms & Conditions</span>
                        </div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                    <CardTitle className="text-lg text-gray-800 dark:text-gray-200">Contact Us</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Phone</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">+91 98765 43210</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Email</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">support@rajyadu.com</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={handleEmailClick}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email Us
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        onClick={handleCallClick}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Us
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Last Updated */}
                <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Last Updated: February 22, 2026</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Privacy Questions?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              If you have any questions about our privacy practices, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={handleEmailClick}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Us
              </Button>
                <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100"
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

export default PrivacyPolicy;
