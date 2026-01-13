import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FormHeader, FormButton, ErrorMessage, FormContainer } from "@/components/FormComponents";
import TextField from "@/components/forms/TextField";
import { TCreateWorkspaceFormProps } from "@/types/login/types";
import { AppText } from "@/components/AppText";

export const CreateWorkspaceForm = ({
  colors,
  errorMessage,
  formValues,
  formErrors,
  showErrors,
  onValueChange,
  onSubmit,
  isLoading,
}: TCreateWorkspaceFormProps) => {
  const router = useRouter();
  const sharedProps = {
    formValues,
    formErrors,
    showErrors,
    onValueChange,
  };

  return (
    <FormContainer>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
        <AppText style={[styles.backText, { color: colors.textSecondary }]}>Back</AppText>
      </TouchableOpacity>

      <FormHeader
        title="Create a workspace"
        subtitle="Set up a new space for your team to collaborate and communicate"
        colors={colors}
      />

      <View
        style={[
          styles.previewCard,
          {
            backgroundColor:
              colors.background === "#090f1d" ? "rgba(107, 78, 255, 0.1)" : "#F5F3FF",
          },
        ]}
      >
        <View style={styles.previewIcon}>
          <AppText style={styles.previewIconText}>
            {formValues.name ? formValues.name[0].toUpperCase() : "W"}
          </AppText>
        </View>
        <View>
          <AppText style={[styles.previewTitle, { color: colors.textPrimary }]}>
            {formValues.name || "Workspace name"}
          </AppText>
          <AppText style={[styles.previewSubtitle, { color: colors.textSecondary }]}>
            1 member • Just you for now
          </AppText>
        </View>
      </View>

      {!!errorMessage && <ErrorMessage message={errorMessage} colors={colors} />}

      <View style={styles.fieldsContainer}>
        <TextField
          name="name"
          placeholder="Select a workspace"
          label="Workspace name"
          {...sharedProps}
        />

        <TextField
          name="description"
          placeholder="What's this workspace for?"
          label="Description (optional)"
          multiline
          numberOfLines={3}
          {...sharedProps}
          style={{ height: 100, textAlignVertical: "top" }}
        />
      </View>

      <FormButton
        title={isLoading ? "Creating..." : "Create workspace"}
        onPress={onSubmit}
        disabled={isLoading}
        colors={colors}
        style={styles.submitButton}
      />

      <AppText style={[styles.footerText, { color: colors.textSecondary }]}>
        You can invite team members after creating the workspace
      </AppText>
    </FormContainer>
  );
};

const styles = StyleSheet.create({
  fieldsContainer: {
    flexDirection: "column",
    gap: 10,
    width: "100%",
  },
  submitButton: {
    marginTop: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 16,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#6B4EFF",
    alignItems: "center",
    justifyContent: "center",
  },
  previewIconText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 12,
  },
  footerText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
  },
});
