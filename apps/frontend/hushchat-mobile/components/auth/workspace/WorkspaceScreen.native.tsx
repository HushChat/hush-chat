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

import React from "react";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { Images } from "@/assets/images";
import { useWorkspaceForm } from "@/hooks/auth/useWorkspaceForm";
import WorkspaceForm from "@/components/auth/workspace/WorkspaceForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";

export default function WorkspaceScreen() {
  const { colors, isDark } = useAuthThemeColors();
  const { formValues, formErrors, showErrors, onValueChange, handleNext } =
    useWorkspaceForm();

  return (
    <AuthMobileLayout colors={colors} image={Images.Workspace}>
      <WorkspaceForm
        colors={colors}
        isDark={isDark}
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
        handleNext={handleNext}
      />
    </AuthMobileLayout>
  );
}
