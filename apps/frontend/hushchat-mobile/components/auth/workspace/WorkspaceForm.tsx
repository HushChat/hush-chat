/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { TWorkspaceFormProps } from "@/types/login/types";
import React from "react";
import {
  FormButton,
  FormContainer,
  FormHeader,
} from "@/components/FormComponents";
import { StyleSheet, View } from "react-native";
import TextField from "@/components/forms/TextField";

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
  formContainer: { flexDirection: "column", gap: 12 },
});
