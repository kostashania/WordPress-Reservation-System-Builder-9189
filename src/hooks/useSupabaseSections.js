import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

export const useSupabaseSections = (userId) => {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userId) {
      loadSections()
    }
  }, [userId])

  const loadSections = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('table_reservation.sections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSections(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading sections:', err)
    } finally {
      setLoading(false)
    }
  }

  const createSection = async (sectionData) => {
    try {
      const { data, error } = await supabase
        .from('table_reservation.sections')
        .insert({
          ...sectionData,
          user_id: userId
        })
        .select()
        .single()

      if (error) throw error
      setSections(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateSection = async (sectionId, updates) => {
    try {
      const { data, error } = await supabase
        .from('table_reservation.sections')
        .update(updates)
        .eq('id', sectionId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      setSections(prev => 
        prev.map(section => 
          section.id === sectionId ? data : section
        )
      )
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteSection = async (sectionId) => {
    try {
      const { error } = await supabase
        .from('table_reservation.sections')
        .delete()
        .eq('id', sectionId)
        .eq('user_id', userId)

      if (error) throw error
      setSections(prev => prev.filter(section => section.id !== sectionId))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const duplicateSection = async (section) => {
    try {
      const newSection = {
        name: `${section.name} (Copy)`,
        settings: section.settings,
        user_id: userId
      }

      const { data, error } = await supabase
        .from('table_reservation.sections')
        .insert(newSection)
        .select()
        .single()

      if (error) throw error
      setSections(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return {
    sections,
    loading,
    error,
    loadSections,
    createSection,
    updateSection,
    deleteSection,
    duplicateSection
  }
}