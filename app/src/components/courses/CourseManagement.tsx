// CourseManagement.tsx — minimal patch
import React, { useEffect, useState } from 'react';
import { BookOpen, Link as LinkIcon, Plus, Trash } from 'lucide-react';
import { User, Course } from '../../types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface CourseManagementProps {
  user: User;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  onNavigate: React.Dispatch<React.SetStateAction<string>>;
}

export type LearningMaterial = {
  id: string;
  title: string;
  type: 'link' | 'video' | 'document';
  url?: string;
};

export type Module = {
  id: string;
  title: string;
  materials: LearningMaterial[];
};

export const CourseManagement: React.FC<CourseManagementProps> = ({
  user,
  courses,
  setCourses,
}) => {
  const role = user.role; // 'student' | 'instructor' | 'admin'
  const [modules, setModules] = useState<Module[]>([]);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  const firstCourse = courses[0]; // keep your original assumption
  const courseId = firstCourse?.id;

  // 1) LOAD ONCE from Firestore (fallback to in-memory demo course if empty)
  useEffect(() => {
    const load = async () => {
      if (!courseId) return;
      try {
        const ref = doc(db, 'courses', courseId);
        const snap = await getDoc(ref);
        const data = snap.exists() ? (snap.data() as any) : null;
        if (data?.modules && Array.isArray(data.modules)) {
          setModules(data.modules);
        } else {
          // fallback to what App.tsx passed in
          setModules((firstCourse?.modules as any) ?? []);
        }
      } catch (e) {
        console.error('Failed to load modules:', e);
        setModules((firstCourse?.modules as any) ?? []);
      }
    };
    load();
  }, [courseId, firstCourse]);

  // 2) EXPLICIT SAVE BUTTON (no autosave on edit)
  const saveAll = async () => {
    if (!courseId) return;
    try {
      const ref = doc(db, 'courses', courseId);
      await setDoc(ref, { modules }, { merge: true }); // persist only when pressing Save

      // keep the app state in sync so other pages (like Dashboard) see it
      setCourses(prev =>
        prev.map(c => (c.id === courseId ? { ...c, modules } as any : c))
      );
      // optionally toast here if you have notifications available
      // addNotification?.('Saved to Firebase', 'success');
    } catch (e) {
      console.error('Failed to save modules:', e);
      // addNotification?.('Save failed', 'error');
    }
  };

  // --- local-only edits (NO firestore writes here) ---
  const addModule = () => {
    if (!newModuleTitle.trim()) return;
    setModules(prev => [
      ...prev,
      { id: Date.now().toString(), title: newModuleTitle.trim(), materials: [] },
    ]);
    setNewModuleTitle('');
  };

  const updateModuleTitle = (id: string, title: string) => {
    setModules(prev => prev.map(m => (m.id === id ? { ...m, title } : m)));
  };

  const addMaterial = (moduleId: string) => {
    const material: LearningMaterial = {
      id: Date.now().toString(),
      title: 'New Material',
      type: 'link',
      url: 'https://drive.google.com/',
    };
    setModules(prev =>
      prev.map(m =>
        m.id === moduleId ? { ...m, materials: [...m.materials, material] } : m
      )
    );
  };

  const updateMaterial = (
    moduleId: string,
    materialId: string,
    updates: Partial<LearningMaterial>
  ) => {
    setModules(prev =>
      prev.map(m =>
        m.id === moduleId
          ? {
              ...m,
              materials: m.materials.map(mat =>
                mat.id === materialId ? { ...mat, ...updates } : mat
              ),
            }
          : m
      )
    );
  };

  const removeMaterial = (moduleId: string, materialId: string) => {
    setModules(prev =>
      prev.map(m =>
        m.id === moduleId
          ? { ...m, materials: m.materials.filter(mat => mat.id !== materialId) }
          : m
      )
    );
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'link': return <LinkIcon className="w-4 h-4 text-blue-500" />;
      case 'video': return <BookOpen className="w-4 h-4 text-red-500" />;
      case 'document': return <BookOpen className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Course Modules</h1>

      {modules.map(mod => (
        <div key={mod.id} className="mb-6 border rounded-xl p-4 bg-white shadow-sm">
          {role !== 'student' ? (
            <input
              type="text"
              value={mod.title}
              onChange={e => updateModuleTitle(mod.id, e.target.value)}
              className="text-lg font-semibold w-full border-b border-gray-300 pb-1 mb-2"
            />
          ) : (
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{mod.title}</h2>
          )}

          <div className="space-y-3">
            {mod.materials.map(mat => (
              <div key={mat.id} className="flex items-center justify-between border p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  {getMaterialIcon(mat.type)}
                  {role === 'student' ? (
                    <a
                      href={mat.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {mat.title}
                    </a>
                  ) : (
                    <>
                      <input
                        value={mat.title}
                        onChange={e => updateMaterial(mod.id, mat.id, { title: e.target.value })}
                        className="text-sm border-b border-gray-300 w-40"
                      />
                      <input
                        value={mat.url || ''}
                        onChange={e => updateMaterial(mod.id, mat.id, { url: e.target.value })}
                        className="text-sm border-b border-gray-300 w-60 ml-2"
                        placeholder="Paste Drive URL"
                      />
                      <select
                        value={mat.type}
                        onChange={e => updateMaterial(mod.id, mat.id, { type: e.target.value as any })}
                        className="text-xs border rounded ml-2"
                      >
                        <option value="link">Link</option>
                        <option value="video">Video</option>
                        <option value="document">Document</option>
                      </select>
                    </>
                  )}
                </div>

                {role !== 'student' && (
                  <Trash
                    className="w-4 h-4 text-red-500 cursor-pointer"
                    onClick={() => removeMaterial(mod.id, mat.id)}
                  />
                )}
              </div>
            ))}
          </div>

          {role !== 'student' && (
            <button
              onClick={() => addMaterial(mod.id)}
              className="mt-4 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Material
            </button>
          )}
        </div>
      ))}

      {role !== 'student' && (
        <div className="mt-6 flex items-center gap-2">
          <input
            value={newModuleTitle}
            onChange={e => setNewModuleTitle(e.target.value)}
            placeholder="New Module Title"
            className="border rounded px-3 py-2"
          />
          <button
            onClick={addModule}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Add Module
          </button>
          {/* NEW: single explicit Save */}
          <button
            onClick={saveAll}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-auto"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};
