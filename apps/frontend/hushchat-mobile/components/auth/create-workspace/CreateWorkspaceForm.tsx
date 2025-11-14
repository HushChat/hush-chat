import React from "react";
import { View, StyleSheet } from "react-native";
import { FormHeader, FormButton, ErrorMessage, FormContainer } from "@/components/FormComponents";
import TextField from "@/components/forms/TextField";
import { TCreateWorkspaceFormProps } from "@/types/login/types";

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
  const sharedProps = {
    formValues,
    formErrors,
    showErrors,
    onValueChange,
  };

  return (
    <FormContainer>
      <FormHeader
        title="Create Your Workspace"
        subtitle="Set up a new workspace to organize your projects and collaborate with your team."
        colors={colors}
      />

      {!!errorMessage && <ErrorMessage message={errorMessage} colors={colors} />}

      <View style={styles.fieldsContainer}>
        <TextField
          name="name"
          placeholder="Workspace Name"
          label="Workspace Name"
          {...sharedProps}
        />

        <TextField
          name="description"
          placeholder="Brief description of your workspace"
          label="Description (Optional)"
          multiline
          numberOfLines={3}
          {...sharedProps}
        />
      </View>

      <FormButton
        title={isLoading ? "Creating Workspace..." : "Create Workspace"}
        onPress={onSubmit}
        disabled={isLoading}
        colors={colors}
        style={{ marginTop: 24 }}
      />
    </FormContainer>
  );
};

const styles = StyleSheet.create({
  fieldsContainer: {
    flexDirection: "column",
    gap: 10,
    width: "100%",
  },
});
