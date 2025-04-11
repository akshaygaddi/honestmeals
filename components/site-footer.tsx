// components/site-footer.tsx
import React from "react"
import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export function SiteFooter() {
    return (
        <footer className="border-t bg-background">
            <div className="container py-8 md:py-12">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Honest Meals</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Customized diet meals for weight loss, muscle gain, and healthy living with authentic Indian flavors.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link href="https://instagram.com" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link href="https://facebook.com" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Facebook className="h-5 w-5" />
                                <span className="sr-only">Facebook</span>
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Menu</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/meal-plans" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Weight Loss Meals
                                </Link>
                            </li>
                            <li>
                                <Link href="/meal-plans" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Muscle Gain Diet
                                </Link>
                            </li>
                            <li>
                                <Link href="/meal-plans" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Maintenance Plans
                                </Link>
                            </li>
                            <li>
                                <Link href="/meal-plans" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Keto Options
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Cookie Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Honest Meals. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}