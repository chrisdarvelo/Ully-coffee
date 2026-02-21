import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthColors, Fonts, Colors } from '../utils/constants';

const LAST_UPDATED = 'February 21, 2026';

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Paragraph({ children }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

function BulletItem({ children }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>-</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export default function PrivacyPolicyScreen({ navigation, route }) {
  const isModal = route?.params?.modal;

  return (
    <SafeAreaView style={styles.container}>
      {isModal && (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.closeBtn}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>

        <Section title="Introduction">
          <Paragraph>
            Ully ("we," "our," or "the app") is a coffee companion app that helps
            baristas and coffee enthusiasts with espresso extraction, equipment
            diagnostics, recipes, and AI-powered assistance. This Privacy Policy
            explains how we handle your information when you use Ully.
          </Paragraph>
        </Section>

        <Section title="Age Requirement">
          <Paragraph>
            Ully is intended for users aged 13 and older. We do not knowingly
            collect personal information from children under 13. If we learn that
            we have collected information from a child under 13, we will
            promptly delete it. If you are a parent or guardian and believe your
            child has provided us with personal information, please contact us.
          </Paragraph>
        </Section>

        <Section title="Information We Collect">
          <Paragraph>We collect the following information when you create an account:</Paragraph>
          <BulletItem>Email address (for authentication)</BulletItem>
          <BulletItem>Date of birth (for age verification only -- not stored on our servers)</BulletItem>
          <BulletItem>Profile information you choose to provide (display location, favorite shops)</BulletItem>
          <BulletItem>Equipment list you add to your profile</BulletItem>
          <BulletItem>Recipes and cafe bookmarks you create</BulletItem>
          <Paragraph>
            This data is stored securely using Google Firebase and is linked to
            your account.
          </Paragraph>
        </Section>

        <Section title="Information We Do NOT Collect">
          <BulletItem>
            Photos and images: When you use the Scan or Dial-in features, photos
            are captured on your device and sent directly to Anthropic's API for
            real-time analysis. We do not store, collect, upload, or retain your
            photos on any server. Once the analysis is complete, the image data
            is discarded from memory.
          </BulletItem>
          <BulletItem>
            Chat content: Your conversation history with Ully AI is stored
            locally on your device only. We do not have access to your chat
            messages.
          </BulletItem>
          <BulletItem>Precise location or GPS data</BulletItem>
          <BulletItem>Contacts, call logs, or other device data</BulletItem>
        </Section>

        <Section title="How We Use Your Information">
          <Paragraph>Your information is used solely to:</Paragraph>
          <BulletItem>Authenticate your account and provide access to app features</BulletItem>
          <BulletItem>Display your profile, equipment, and recipes within the app</BulletItem>
          <BulletItem>Personalize your experience (e.g., greeting you by name)</BulletItem>
          <Paragraph>
            We do not sell, share, or rent your personal information to third
            parties for marketing or advertising purposes.
          </Paragraph>
        </Section>

        <Section title="Third-Party Services">
          <Paragraph>Ully uses the following third-party services:</Paragraph>
          <BulletItem>
            Google Firebase: For authentication, profile storage, and data
            persistence. Subject to Google's Privacy Policy.
          </BulletItem>
          <BulletItem>
            Anthropic API (Claude): For AI-powered chat responses and photo
            analysis. When you send a message or photo to Ully AI, it is
            transmitted to Anthropic's API for processing. Per Anthropic's API
            terms, inputs sent via the API are not used to train their models
            and are retained only briefly for trust and safety monitoring.
            Refer to Anthropic's Usage Policy for details.
          </BulletItem>
          <Paragraph>
            We do not use any analytics, advertising, or tracking SDKs.
          </Paragraph>
        </Section>

        <Section title="Camera and Photo Library Access">
          <Paragraph>
            Ully requests camera access to enable the Scan (part identification)
            and Dial-in (extraction analysis) features. Photo library access is
            requested as an alternative for uploading existing photos for analysis.
          </Paragraph>
          <Paragraph>
            Photos are processed on-device and sent directly to Anthropic's API.
            They are not uploaded to our servers, stored in your account, or
            shared with any other party.
          </Paragraph>
        </Section>

        <Section title="Data Storage and Security">
          <BulletItem>
            Account data (email, profile, equipment, recipes) is stored in
            Google Firebase with industry-standard encryption.
          </BulletItem>
          <BulletItem>
            Chat history is stored locally on your device using encrypted
            device storage and is never transmitted to our servers.
          </BulletItem>
        </Section>

        <Section title="Your Rights">
          <Paragraph>You have the right to:</Paragraph>
          <BulletItem>Access your personal data through the app's Profile section</BulletItem>
          <BulletItem>Edit or update your profile information at any time</BulletItem>
          <BulletItem>Delete your account and all associated data directly within the app</BulletItem>
          <BulletItem>Clear your local chat history at any time through the app</BulletItem>
          <BulletItem>Contact us at support@ullycoffee.com to request data deletion if you are unable to access the app</BulletItem>
        </Section>

        <Section title="Account Deletion">
          <Paragraph>
            You can permanently delete your account at any time from within the
            app. To delete your account:
          </Paragraph>
          <BulletItem>Open the app and go to the Profile tab</BulletItem>
          <BulletItem>Scroll to the bottom and tap "Delete Account"</BulletItem>
          <BulletItem>Enter your password to confirm your identity</BulletItem>
          <BulletItem>Tap Delete to permanently remove your account</BulletItem>
          <Paragraph>
            When you delete your account, the following data is permanently and
            immediately removed:
          </Paragraph>
          <BulletItem>Your Firebase Authentication account and login credentials</BulletItem>
          <BulletItem>Your profile, equipment list, recipes, and saved cafes stored on our servers</BulletItem>
          <BulletItem>Any media files you uploaded, stored in Firebase Storage</BulletItem>
          <BulletItem>Your local chat history and all app data stored on your device</BulletItem>
          <Paragraph>
            Account deletion is permanent and cannot be undone. If you cannot
            access the app, you may request deletion by emailing
            support@ullycoffee.com. We will process your request within 30 days.
          </Paragraph>
        </Section>

        <Section title="Changes to This Policy">
          <Paragraph>
            We may update this Privacy Policy from time to time. We will notify
            you of any material changes by posting the updated policy within the
            app. Continued use of Ully after changes constitutes acceptance of
            the updated policy.
          </Paragraph>
        </Section>

        <Section title="Contact">
          <Paragraph>
            If you have questions about this Privacy Policy or your data,
            please contact us at: support@ullycoffee.com
          </Paragraph>
        </Section>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  closeBtn: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Fonts.mono,
    marginBottom: 4,
  },
  updated: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: Fonts.mono,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: Fonts.mono,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    paddingLeft: 4,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    marginRight: 8,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontFamily: Fonts.mono,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 40,
  },
});
