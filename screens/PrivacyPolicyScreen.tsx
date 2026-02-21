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
const EFFECTIVE_DATE = 'February 21, 2026';

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
        <Text style={styles.updated}>Effective: {EFFECTIVE_DATE}</Text>

        <Section title="Introduction">
          <Paragraph>
            Ully ("we," "our," or "the app") is an AI-powered coffee companion
            that helps baristas and coffee enthusiasts with espresso extraction,
            equipment diagnostics, recipes, and brewing guidance. Responses are
            generated in real-time by an artificial intelligence model (Claude,
            by Anthropic).
          </Paragraph>
          <Paragraph>
            This Privacy Policy explains what data we collect, what we do not
            collect, and how we handle your information. We are committed to
            collecting the absolute minimum data necessary to operate the app.
          </Paragraph>
        </Section>

        <Section title="Age Requirement">
          <Paragraph>
            Ully is intended for users aged 13 and older. We do not knowingly
            collect personal information from children under 13. If you are a
            parent or guardian and believe your child has provided us with
            personal information, please contact us at support@ullycoffee.com
            and we will promptly delete it.
          </Paragraph>
        </Section>

        <Section title="What We Collect (Minimum Necessary)">
          <Paragraph>
            The only information we collect and store on our servers is:
          </Paragraph>
          <BulletItem>
            Email address — used solely to create and authenticate your account
            via Firebase Authentication. We do not use it for marketing.
          </BulletItem>
          <Paragraph>
            Everything else — your profile, recipes, saved cafes, equipment
            list, and chat history — is stored locally on your device only and
            never transmitted to our servers.
          </Paragraph>
        </Section>

        <Section title="What We Do NOT Collect">
          <BulletItem>
            Chat messages and AI conversations: Your chat history with Ully AI
            is stored on your device only using local device storage. We have
            no access to your conversations.
          </BulletItem>
          <BulletItem>
            Photos and images: When you use Scan or Dial-in, photos are sent
            directly to Anthropic's API for real-time analysis. We do not
            store, upload, or retain your photos on any server. Images are
            discarded from memory after the AI response is returned.
          </BulletItem>
          <BulletItem>
            Location or GPS data: We request approximate location permission
            only to provide weather-aware coffee recommendations. Your location
            is never stored, logged, or transmitted to our servers.
          </BulletItem>
          <BulletItem>
            Profile and app data: Your username, role, recipes, saved cafes,
            equipment list, and barista follows are stored locally on your
            device only — not on our servers.
          </BulletItem>
          <BulletItem>
            Date of birth: Used only for the one-time age verification check
            at signup. It is never stored on our servers or on your device.
          </BulletItem>
          <BulletItem>
            Behavioral or analytics data: We do not use any analytics,
            advertising, or tracking SDKs.
          </BulletItem>
          <BulletItem>
            Contacts, call logs, browsing history, or any other device data.
          </BulletItem>
        </Section>

        <Section title="Artificial Intelligence & Generated Content">
          <Paragraph>
            Ully uses Claude, a large language model developed by Anthropic,
            to generate responses to your questions and analyze photos you
            submit. This means:
          </Paragraph>
          <BulletItem>
            All AI responses are generated in real-time and may not always be
            accurate. Do not rely on Ully for safety-critical decisions.
          </BulletItem>
          <BulletItem>
            When you send a message or photo, it is transmitted to Anthropic's
            API for processing. Per Anthropic's API terms, your inputs are not
            used to train their models and are retained only briefly for trust
            and safety monitoring. See Anthropic's Privacy Policy for details.
          </BulletItem>
          <BulletItem>
            AI responses are proxied through a Firebase Cloud Function — your
            queries never include your email or account identifiers when sent
            to Anthropic.
          </BulletItem>
          <BulletItem>
            You can report any AI response you find inaccurate or inappropriate
            by tapping the "Report" button below any Ully response in the chat.
          </BulletItem>
          <Paragraph>
            Ully AI is a coffee-specific assistant. It is not a substitute for
            professional equipment repair, medical, legal, or financial advice.
          </Paragraph>
        </Section>

        <Section title="Camera and Photo Library">
          <Paragraph>
            Ully requests camera and photo library access only for the Dial-in
            (extraction analysis) and Scan (part identification) AI features.
            You may deny these permissions and the rest of the app will continue
            to function normally.
          </Paragraph>
          <Paragraph>
            Photos are never uploaded to our servers, never stored in your
            account, and never shared with any party other than Anthropic's API
            for the specific analysis you requested.
          </Paragraph>
        </Section>

        <Section title="How We Use Your Email">
          <Paragraph>
            Your email address is used solely to:
          </Paragraph>
          <BulletItem>Create and authenticate your Ully account</BulletItem>
          <BulletItem>Send a password reset email if you request one</BulletItem>
          <Paragraph>
            We do not send marketing emails. We do not share your email with
            third parties for any purpose.
          </Paragraph>
        </Section>

        <Section title="Data Storage and Security">
          <BulletItem>
            Your email and authentication credentials are stored securely with
            Google Firebase Authentication using industry-standard encryption.
          </BulletItem>
          <BulletItem>
            All other app data (profile, recipes, cafes, chat history) is
            stored locally on your device using AsyncStorage and is never
            transmitted to our servers.
          </BulletItem>
          <BulletItem>
            We do not maintain any database of user-generated content, recipes,
            or conversations.
          </BulletItem>
        </Section>

        <Section title="Third-Party Services">
          <BulletItem>
            Google Firebase (Authentication only): Stores your email address
            and manages secure sign-in. Subject to Google's Privacy Policy.
          </BulletItem>
          <BulletItem>
            Anthropic (Claude API): Processes your AI chat messages and photos
            in real-time. Inputs are not used for model training. Subject to
            Anthropic's Privacy Policy and Usage Policy.
          </BulletItem>
          <BulletItem>
            wttr.in (Weather): Provides approximate weather data based on
            your coarse location. No account or identifier is transmitted.
          </BulletItem>
          <Paragraph>
            We do not use analytics SDKs, advertising networks, crash reporting
            services, or any other third-party data collection tools.
          </Paragraph>
        </Section>

        <Section title="We Do Not Sell Your Data">
          <Paragraph>
            We do not sell, rent, trade, or share your personal information
            with any third party for commercial or marketing purposes. This
            applies to all users, including California residents under the
            California Consumer Privacy Act (CCPA).
          </Paragraph>
        </Section>

        <Section title="Your Rights">
          <Paragraph>You have the right to:</Paragraph>
          <BulletItem>Access the email address linked to your account</BulletItem>
          <BulletItem>Edit or update your local profile at any time through the app</BulletItem>
          <BulletItem>Delete your account and all associated data directly within the app</BulletItem>
          <BulletItem>Clear your local chat history at any time through the app</BulletItem>
          <BulletItem>
            Request data deletion by emailing support@ullycoffee.com if you
            cannot access the app
          </BulletItem>
          <Paragraph>
            California residents have additional rights under the CCPA,
            including the right to know what personal data is collected and
            the right to opt out of data sales (we do not sell data).
            EEA/UK residents have rights under GDPR including access,
            rectification, erasure, and portability of personal data.
            Contact support@ullycoffee.com to exercise any of these rights.
          </Paragraph>
        </Section>

        <Section title="Account Deletion">
          <Paragraph>
            You can permanently delete your account at any time from within
            the app. To delete your account:
          </Paragraph>
          <BulletItem>Open the app and go to the Profile tab</BulletItem>
          <BulletItem>Scroll to the bottom and tap "Delete Account"</BulletItem>
          <BulletItem>Enter your password to confirm your identity</BulletItem>
          <BulletItem>Tap Delete to permanently remove your account</BulletItem>
          <Paragraph>
            When you delete your account, the following is permanently removed:
          </Paragraph>
          <BulletItem>Your Firebase Authentication account and login credentials</BulletItem>
          <BulletItem>Any Firebase Storage files associated with your account</BulletItem>
          <BulletItem>All local app data on your device (profile, recipes, cafes, chat history)</BulletItem>
          <Paragraph>
            Because your recipes, profile, and other app data are stored only
            on your device, account deletion removes all of it immediately.
            There is no server-side user database to purge. Account deletion
            is permanent and cannot be undone.
          </Paragraph>
          <Paragraph>
            If you cannot access the app, email support@ullycoffee.com.
            We will process your request within 30 days.
          </Paragraph>
        </Section>

        <Section title="Changes to This Policy">
          <Paragraph>
            We may update this Privacy Policy from time to time. We will
            notify you of material changes by posting the updated policy
            within the app. Continued use of Ully after changes constitutes
            acceptance of the updated policy.
          </Paragraph>
        </Section>

        <Section title="Contact">
          <Paragraph>
            Questions about this Privacy Policy or your data:{'\n'}
            support@ullycoffee.com
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
