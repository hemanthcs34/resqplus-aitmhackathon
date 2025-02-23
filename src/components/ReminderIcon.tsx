/**
 * ReminderIcon Component
 * 
 * A floating action button that manages medication reminders and notifications.
 * Positioned in the top-left corner of the application.
 * 
 * Features:
 * - Shows/hides reminder modal
 * - Displays notification dot for active reminders
 * - Integrates with ReminderService for persistence
 * - Shows toast notifications for feedback
 */

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReminderModal } from './ReminderModal';
import { useToast } from "../hooks/use-toast";
import ReminderService from '../services/ReminderService';

// Type definition for reminder form data
interface ReminderData {
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;  // Add end date field
}

const ReminderIcon = () => {
  // State for modal visibility and active reminders indicator
  const [isOpen, setIsOpen] = useState(false);
  const [hasActiveReminders, setHasActiveReminders] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    /**
     * Checks for active reminders and updates the notification dot
     * Runs every minute to keep the UI in sync with scheduled reminders
     */
    const checkActiveReminders = () => {
      try {
        const reminders = ReminderService.getReminders();
        // Check if any reminder has pending notifications
        const hasActive = reminders.some(reminder => 
          reminder.notifications?.some(n => n.status === 'pending')
        );
        setHasActiveReminders(hasActive);
      } catch (error) {
        console.error('Error checking reminders:', error);
      }
    };

    // Initialize notification system and start checking
    ReminderService.initNotificationChecker();
    checkActiveReminders();

    // Set up periodic checks
    const interval = setInterval(checkActiveReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  /**
   * Handles form submission from the ReminderModal
   * Saves the reminder and shows confirmation/health tip toasts
   */
  const handleSubmit = (data: ReminderData) => {
    try {
      // Validate dates before saving
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (endDate < startDate) {
        toast({
          title: "Invalid Dates",
          description: "End date must be after start date",
          duration: 3000,
        });
        return;
      }

      // Save reminder and schedule notifications
      const reminder = ReminderService.saveReminder(data);

      toast({
        title: "Reminder Set!",
        description: `Reminder set for ${data.medicationName} from ${data.startDate} to ${data.endDate}`,
        duration: 3000,
      });

      // Show health tip based on medication
      toast({
        title: "Daily Health Tip",
        description: ReminderService.getDailyTip(data.medicationName),
        duration: 5000,
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast({
        title: "Error",
        description: "Failed to set reminder. Please try again.",
        duration: 3000,
      });
    }
  };

  return (
    <>
      {/* Floating Action Button with Bell Icon */}
      <motion.div
        className="fixed top-4 left-4 z-50 cursor-pointer bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
      >
        <Bell className="w-6 h-6 text-primary" />
        {/* Notification Dot - Shows when there are active reminders */}
        {hasActiveReminders && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          />
        )}
      </motion.div>

      {/* Reminder Modal - Opens when bell is clicked */}
      <ReminderModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default ReminderIcon;