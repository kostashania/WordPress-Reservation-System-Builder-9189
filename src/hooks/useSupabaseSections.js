import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

export const useSupabaseSections = (userId) => {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userId) {
      loadSections()
    } else {
      setLoading(false)
    }
  }, [userId])

  const loadSections = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading sections for user:', userId)
      
      // Add timeout for sections loading
      const sectionsPromise = supabase
        .from('table_reservation.sections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sections loading timeout')), 5000)
      )

      const { data, error } = await Promise.race([
        sectionsPromise,
        timeoutPromise
      ])

      if (error) {
        console.error('Error loading sections:', error)
        
        // If table doesn't exist or there's a schema issue, fall back to empty array
        if (error.code === '42P01' || error.code === 'PGRST204' || error.message.includes('timeout')) {
          console.warn('Sections table not available, using empty array')
          setSections([])
          setLoading(false)
          return
        }
        
        throw error
      }

      console.log('Sections loaded:', data?.length || 0)
      setSections(data || [])
    } catch (err) {
      console.error('Error in loadSections:', err)
      setError(err.message)
      setSections([]) // Fallback to empty array
    } finally {
      setLoading(false)
    }
  }

  const createSection = async (sectionData) => {
    if (!userId) {
      throw new Error('User not authenticated')
    }

    try {
      console.log('Creating section:', sectionData)
      
      const createPromise = supabase
        .from('table_reservation.sections')
        .insert({
          ...sectionData,
          user_id: userId
        })
        .select()
        .single()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Create timeout')), 10000)
      )

      const { data, error } = await Promise.race([
        createPromise,
        timeoutPromise
      ])

      if (error) {
        console.error('Error creating section:', error)
        throw error
      }

      console.log('Section created:', data)
      setSections(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error in createSection:', err)
      setError(err.message)
      throw err
    }
  }

  const updateSection = async (sectionId, updates) => {
    if (!userId) {
      throw new Error('User not authenticated')
    }

    try {
      console.log('Updating section:', sectionId, updates)
      
      const updatePromise = supabase
        .from('table_reservation.sections')
        .update(updates)
        .eq('id', sectionId)
        .eq('user_id', userId)
        .select()
        .single()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Update timeout')), 10000)
      )

      const { data, error } = await Promise.race([
        updatePromise,
        timeoutPromise
      ])

      if (error) {
        console.error('Error updating section:', error)
        throw error
      }

      console.log('Section updated:', data)
      setSections(prev => 
        prev.map(section => 
          section.id === sectionId ? data : section
        )
      )
      return data
    } catch (err) {
      console.error('Error in updateSection:', err)
      setError(err.message)
      throw err
    }
  }

  const deleteSection = async (sectionId) => {
    if (!userId) {
      throw new Error('User not authenticated')
    }

    try {
      console.log('Deleting section:', sectionId)
      
      const deletePromise = supabase
        .from('table_reservation.sections')
        .delete()
        .eq('id', sectionId)
        .eq('user_id', userId)

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Delete timeout')), 5000)
      )

      const { error } = await Promise.race([
        deletePromise,
        timeoutPromise
      ])

      if (error) {
        console.error('Error deleting section:', error)
        throw error
      }

      console.log('Section deleted:', sectionId)
      setSections(prev => prev.filter(section => section.id !== sectionId))
    } catch (err) {
      console.error('Error in deleteSection:', err)
      setError(err.message)
      throw err
    }
  }

  const duplicateSection = async (section) => {
    if (!userId) {
      throw new Error('User not authenticated')
    }

    try {
      console.log('Duplicating section:', section)
      
      const newSection = {
        name: `${section.name} (Copy)`,
        settings: section.settings,
        user_id: userId
      }

      const duplicatePromise = supabase
        .from('table_reservation.sections')
        .insert(newSection)
        .select()
        .single()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Duplicate timeout')), 10000)
      )

      const { data, error } = await Promise.race([
        duplicatePromise,
        timeoutPromise
      ])

      if (error) {
        console.error('Error duplicating section:', error)
        throw error
      }

      console.log('Section duplicated:', data)
      setSections(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error in duplicateSection:', err)
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