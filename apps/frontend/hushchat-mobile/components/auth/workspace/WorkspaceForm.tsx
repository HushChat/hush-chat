import { TWorkspaceFormProps } from '@/types/login/types';
import React from 'react';
import { FormButton, FormContainer, FormHeader } from '@/components/FormComponents';
import { StyleSheet, View } from 'react-native';
import TextField from '@/components/forms/TextField';

const WorkspaceForm = ({
  colors,
  formValues,
  formErrors,
  showErrors,
  onValueChange,
  handleNext,
}: TWorkspaceFormProps) => (
  <FormContainer>
    <FormHeader
      title="Select a Workspace"
      subtitle="Enter your workspace name to get started"
      colors={colors}
    />

    <View style={styles.formContainer}>
      <TextField
        label="Workspace Name"
        name="workspaceName"
        placeholder="Enter workspace name"
        autoCapitalize="none"
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
      />

      <FormButton
        title="Next"
        onPress={handleNext}
        disabled={!formValues.workspaceName?.trim()}
        colors={colors}
      />
    </View>
  </FormContainer>
);

export default WorkspaceForm;

const styles = StyleSheet.create({
  formContainer: { flexDirection: 'column', gap: 12 },
});
